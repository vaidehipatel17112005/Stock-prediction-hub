"""
Database module — PostgreSQL via psycopg2
All persistent state: users, sessions, watchlist, prediction history.
"""
import os
import threading
import hashlib
import logging

import psycopg2
from psycopg2.extras import RealDictCursor

logger = logging.getLogger(__name__)

_local = threading.local()


# ── Connection management ───────────────────────────────────────────────────

def _new_conn():
    url = os.environ.get('DATABASE_URL')
    if not url:
        raise RuntimeError('DATABASE_URL environment variable is not set')
    conn = psycopg2.connect(url)
    conn.autocommit = False
    return conn


def _conn():
    """Return a live per-thread connection, reconnecting on stale socket."""
    c = getattr(_local, 'conn', None)
    if c is None or c.closed:
        _local.conn = _new_conn()
        return _local.conn
    try:
        with c.cursor() as cur:
            cur.execute('SELECT 1')
        return c
    except Exception:
        try:
            c.close()
        except Exception:
            pass
        _local.conn = _new_conn()
        return _local.conn


def execute(sql, params=None, fetch='none'):
    """
    Run a single SQL statement.
      fetch='one'  → returns dict or None
      fetch='all'  → returns list[dict]
      fetch='none' → returns None (INSERT/UPDATE/DELETE)
    """
    c = _conn()
    try:
        with c.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            if fetch == 'one':
                row = cur.fetchone()
                c.commit()
                return dict(row) if row else None
            elif fetch == 'all':
                rows = c.fetchall() if False else cur.fetchall()
                c.commit()
                return [dict(r) for r in rows]
            else:
                c.commit()
                return None
    except Exception:
        c.rollback()
        raise


# ── Schema init ─────────────────────────────────────────────────────────────

def init_schema():
    """Create tables if they don't exist and seed default users. Idempotent."""
    c = _conn()
    try:
        with c.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id                SERIAL PRIMARY KEY,
                    username          VARCHAR(100) UNIQUE NOT NULL,
                    email             VARCHAR(255) UNIQUE NOT NULL,
                    password_hash     VARCHAR(64)  NOT NULL,
                    full_name         VARCHAR(255),
                    role              VARCHAR(20)  NOT NULL DEFAULT 'user',
                    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                    last_login        TIMESTAMPTZ,
                    predictions_count INTEGER      NOT NULL DEFAULT 0
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    token      VARCHAR(36) PRIMARY KEY,
                    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS watchlist (
                    id       SERIAL PRIMARY KEY,
                    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    symbol   VARCHAR(50)  NOT NULL,
                    name     VARCHAR(255),
                    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    UNIQUE(user_id, symbol)
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS prediction_history (
                    id               SERIAL PRIMARY KEY,
                    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    symbol           VARCHAR(50)  NOT NULL,
                    model_type       VARCHAR(50)  NOT NULL,
                    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                    r2_score         DOUBLE PRECISION,
                    mae              DOUBLE PRECISION,
                    rmse             DOUBLE PRECISION,
                    accuracy         DOUBLE PRECISION,
                    recommendation   VARCHAR(20),
                    confidence_score DOUBLE PRECISION
                )
            """)
        c.commit()
        _seed_users()
        logger.info('Database schema ready.')
    except Exception as e:
        c.rollback()
        logger.error('Schema init failed: %s', e)
        raise


# ── Password ────────────────────────────────────────────────────────────────

def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()


def _seed_users():
    seeds = [
        ('admin', 'admin@stockai.com', 'admin123', 'Admin User',  'admin', 0),
        ('demo',  'demo@stockai.com',  'demo123',  'Demo User',   'user',  12),
    ]
    for username, email, pw, full_name, role, pcount in seeds:
        execute("""
            INSERT INTO users (username, email, password_hash, full_name, role, predictions_count)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO NOTHING
        """, (username, email, hash_pw(pw), full_name, role, pcount))


# ── Formatting helpers ──────────────────────────────────────────────────────

def _ts(val):
    """Format a datetime/None to ISO string."""
    if val is None:
        return None
    return val.isoformat() if hasattr(val, 'isoformat') else str(val)


# ── User helpers ────────────────────────────────────────────────────────────

def user_to_dict(u):
    if not u:
        return None
    return {
        'id':               u['id'],
        'username':         u['username'],
        'email':            u['email'],
        'fullName':         u.get('full_name'),
        'role':             u['role'],
        'createdAt':        _ts(u.get('created_at')),
        'predictionsCount': u.get('predictions_count', 0),
    }


def get_user_by_id(uid):
    return execute('SELECT * FROM users WHERE id = %s', (uid,), fetch='one')


def get_user_by_email(email):
    return execute('SELECT * FROM users WHERE email = %s', (email.lower(),), fetch='one')


def create_user(username, email, password, full_name=None):
    """Insert a new user and return the row, or raise psycopg2.IntegrityError on duplicate."""
    return execute("""
        INSERT INTO users (username, email, password_hash, full_name)
        VALUES (%s, %s, %s, %s)
        RETURNING *
    """, (username, email.lower(), hash_pw(password), full_name or None), fetch='one')


def touch_last_login(uid):
    execute('UPDATE users SET last_login = NOW() WHERE id = %s', (uid,))


# ── Session helpers ─────────────────────────────────────────────────────────

def create_session(token, user_id):
    execute('INSERT INTO sessions (token, user_id) VALUES (%s, %s)', (token, user_id))


def get_session_user_id(token):
    row = execute('SELECT user_id FROM sessions WHERE token = %s', (token,), fetch='one')
    return row['user_id'] if row else None


def delete_session(token):
    execute('DELETE FROM sessions WHERE token = %s', (token,))


# ── Watchlist ────────────────────────────────────────────────────────────────

def get_watchlist(user_id):
    return execute(
        'SELECT * FROM watchlist WHERE user_id = %s ORDER BY added_at DESC',
        (user_id,), fetch='all',
    )


def add_to_watchlist(user_id, symbol, name=None):
    return execute("""
        INSERT INTO watchlist (user_id, symbol, name)
        VALUES (%s, %s, %s)
        ON CONFLICT (user_id, symbol) DO UPDATE SET name = EXCLUDED.name
        RETURNING *
    """, (user_id, symbol.upper(), name or symbol.upper()), fetch='one')


def remove_from_watchlist(user_id, symbol):
    execute(
        'DELETE FROM watchlist WHERE user_id = %s AND symbol = %s',
        (user_id, symbol.upper()),
    )


# ── Prediction history ────────────────────────────────────────────────────────

def log_prediction(user_id, symbol, model_type, metrics, recommendation, confidence_score):
    m = metrics or {}
    execute("""
        INSERT INTO prediction_history
            (user_id, symbol, model_type, r2_score, mae, rmse, accuracy, recommendation, confidence_score)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        user_id, symbol.upper(), model_type,
        m.get('r2Score'), m.get('mae'), m.get('rmse'), m.get('accuracy'),
        recommendation, confidence_score,
    ))
    execute(
        'UPDATE users SET predictions_count = predictions_count + 1 WHERE id = %s',
        (user_id,),
    )


def get_prediction_history(user_id):
    rows = execute("""
        SELECT id, symbol, model_type, created_at,
               r2_score, mae, rmse, accuracy, recommendation, confidence_score
        FROM prediction_history
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 100
    """, (user_id,), fetch='all') or []
    return [
        {
            'id':              r['id'],
            'symbol':          r['symbol'],
            'modelType':       r['model_type'],
            'createdAt':       _ts(r['created_at']),
            'metrics': {
                'r2Score':  r['r2_score'],
                'mae':      r['mae'],
                'rmse':     r['rmse'],
                'accuracy': r['accuracy'],
            },
            'recommendation':  r['recommendation'],
            'confidenceScore': r['confidence_score'],
        }
        for r in rows
    ]


# ── Admin ─────────────────────────────────────────────────────────────────────

def get_all_users():
    rows = execute("""
        SELECT id, username, email, role, created_at, last_login, predictions_count
        FROM users ORDER BY id
    """, fetch='all') or []
    return [
        {
            'id':               r['id'],
            'username':         r['username'],
            'email':            r['email'],
            'role':             r['role'],
            'createdAt':        _ts(r['created_at']),
            'lastLogin':        _ts(r['last_login']),
            'predictionsCount': r['predictions_count'],
        }
        for r in rows
    ]


def delete_user(uid):
    execute('DELETE FROM users WHERE id = %s', (uid,))


def get_total_predictions():
    row = execute(
        'SELECT COALESCE(SUM(predictions_count), 0) AS total FROM users',
        fetch='one',
    )
    return int(row['total']) if row else 0


def get_total_users():
    row = execute('SELECT COUNT(*) AS n FROM users', fetch='one')
    return int(row['n']) if row else 0


def get_popular_symbols(limit=5):
    rows = execute("""
        SELECT symbol, COUNT(*) AS cnt
        FROM prediction_history
        GROUP BY symbol
        ORDER BY cnt DESC
        LIMIT %s
    """, (limit,), fetch='all') or []
    return [{'symbol': r['symbol'], 'count': int(r['cnt'])} for r in rows]

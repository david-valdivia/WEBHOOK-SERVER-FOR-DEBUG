const Endpoint = require('../models/endpoint');
const database = require('../config/database');

class EndpointRepository {
    async findAll() {
        const db = database.getConnection();
        const rows = await db.all(`
            SELECT e.id, e.path, e.created_at, COUNT(r.id) as request_count
            FROM endpoints e
            LEFT JOIN requests r ON e.id = r.endpoint_id
            GROUP BY e.id, e.path, e.created_at
            ORDER BY e.created_at DESC
        `);
        
        return rows.map(row => Endpoint.fromDatabase(row));
    }

    async findById(id) {
        const db = database.getConnection();
        const row = await db.get('SELECT * FROM endpoints WHERE id = ?', id);
        
        if (!row) {
            return null;
        }
        
        return Endpoint.fromDatabase(row);
    }

    async findByPath(path) {
        const db = database.getConnection();
        const row = await db.get('SELECT * FROM endpoints WHERE path = ?', path);
        
        if (!row) {
            return null;
        }
        
        return Endpoint.fromDatabase(row);
    }

    async create(endpointData) {
        const db = database.getConnection();
        
        const result = await db.run(
            'INSERT INTO endpoints (path) VALUES (?)',
            [endpointData.path]
        );
        
        const created = await this.findById(result.lastID);
        return created;
    }

    async update(id, updateData) {
        const db = database.getConnection();
        
        const setClauses = [];
        const values = [];
        
        if (updateData.path !== undefined) {
            setClauses.push('path = ?');
            values.push(updateData.path);
        }
        
        if (setClauses.length === 0) {
            throw new Error('No fields to update');
        }
        
        values.push(id);
        
        await db.run(
            `UPDATE endpoints SET ${setClauses.join(', ')} WHERE id = ?`,
            values
        );
        
        return this.findById(id);
    }

    async delete(id) {
        const db = database.getConnection();
        const result = await db.run('DELETE FROM endpoints WHERE id = ?', id);
        
        return result.changes > 0;
    }

    async deleteByPath(path) {
        const db = database.getConnection();
        const result = await db.run('DELETE FROM endpoints WHERE path = ?', path);
        
        return result.changes > 0;
    }

    async exists(path) {
        const db = database.getConnection();
        const row = await db.get('SELECT 1 FROM endpoints WHERE path = ? LIMIT 1', path);
        
        return !!row;
    }
}

module.exports = new EndpointRepository();
const Request = require('../models/request');
const database = require('../config/database');

class RequestRepository {
    async findAll() {
        const db = database.getConnection();
        const rows = await db.all(`
            SELECT * FROM requests 
            ORDER BY timestamp DESC
        `);
        
        return rows.map(row => Request.fromDatabase(row));
    }

    async findById(id) {
        const db = database.getConnection();
        const row = await db.get('SELECT * FROM requests WHERE id = ?', id);
        
        if (!row) {
            return null;
        }
        
        return Request.fromDatabase(row);
    }

    async findByEndpointId(endpointId) {
        const db = database.getConnection();
        const rows = await db.all(`
            SELECT * FROM requests 
            WHERE endpoint_id = ? 
            ORDER BY timestamp DESC
        `, endpointId);
        
        return rows.map(row => Request.fromDatabase(row));
    }

    async create(requestData) {
        const db = database.getConnection();
        const data = requestData.toDatabaseFormat ? requestData.toDatabaseFormat() : requestData;
        
        const result = await db.run(`
            INSERT INTO requests (endpoint_id, method, headers, query_params, body, response_type, response_details)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            data.endpoint_id,
            data.method,
            data.headers,
            data.query_params,
            data.body,
            data.response_type || 'custom',
            data.response_details
        ]);
        
        const created = await this.findById(result.lastID);
        return created;
    }

    async delete(id) {
        const db = database.getConnection();
        const result = await db.run('DELETE FROM requests WHERE id = ?', id);
        
        return result.changes > 0;
    }

    async deleteByEndpointId(endpointId) {
        const db = database.getConnection();
        const result = await db.run('DELETE FROM requests WHERE endpoint_id = ?', endpointId);
        
        return result.changes;
    }

    async deleteByEndpointIdAndRequestId(endpointId, requestId) {
        const db = database.getConnection();
        const result = await db.run(
            'DELETE FROM requests WHERE id = ? AND endpoint_id = ?', 
            [requestId, endpointId]
        );
        
        return result.changes > 0;
    }

    async countByEndpointId(endpointId) {
        const db = database.getConnection();
        const row = await db.get(
            'SELECT COUNT(*) as count FROM requests WHERE endpoint_id = ?', 
            endpointId
        );
        
        return row.count;
    }
}

module.exports = new RequestRepository();
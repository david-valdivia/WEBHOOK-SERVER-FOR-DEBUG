const Response = require('../models/response');
const database = require('../config/database');

class ResponseRepository {
    async findById(id) {
        const db = database.getConnection();
        const row = await db.get('SELECT * FROM responses WHERE id = ?', id);
        
        if (!row) {
            return null;
        }
        
        return Response.fromDatabase(row);
    }

    async findByEndpointId(endpointId) {
        const db = database.getConnection();
        const row = await db.get('SELECT * FROM responses WHERE endpoint_id = ?', endpointId);
        
        if (!row) {
            return null;
        }
        
        return Response.fromDatabase(row);
    }

    async create(responseData) {
        const db = database.getConnection();
        const data = responseData.toDatabaseFormat ? responseData.toDatabaseFormat() : responseData;
        
        const result = await db.run(`
            INSERT INTO responses (endpoint_id, response_type, status_code, content_type, body, delay, target_url, preserve_headers) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.endpoint_id,
            data.response_type || 'custom',
            data.status_code,
            data.content_type,
            data.body,
            data.delay,
            data.target_url,
            data.preserve_headers !== undefined ? (data.preserve_headers ? 1 : 0) : 1
        ]);
        
        const created = await this.findById(result.lastID);
        return created;
    }

    async update(endpointId, updateData) {
        const db = database.getConnection();
        
        const result = await db.run(`
            UPDATE responses 
            SET response_type = ?, status_code = ?, content_type = ?, body = ?, delay = ?, target_url = ?, preserve_headers = ?
            WHERE endpoint_id = ?
        `, [
            updateData.response_type || 'custom',
            updateData.status_code,
            updateData.content_type,
            updateData.body,
            updateData.delay || 0,
            updateData.target_url,
            updateData.preserve_headers !== undefined ? (updateData.preserve_headers ? 1 : 0) : 1,
            endpointId
        ]);
        
        if (result.changes === 0) {
            return null;
        }
        
        return this.findByEndpointId(endpointId);
    }

    async delete(id) {
        const db = database.getConnection();
        const result = await db.run('DELETE FROM responses WHERE id = ?', id);
        
        return result.changes > 0;
    }

    async deleteByEndpointId(endpointId) {
        const db = database.getConnection();
        const result = await db.run('DELETE FROM responses WHERE endpoint_id = ?', endpointId);
        
        return result.changes > 0;
    }

    async exists(endpointId) {
        const db = database.getConnection();
        const row = await db.get(
            'SELECT 1 FROM responses WHERE endpoint_id = ? LIMIT 1', 
            endpointId
        );
        
        return !!row;
    }
}

module.exports = new ResponseRepository();
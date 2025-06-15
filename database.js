
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

// Configurar SQLite
const dbPath = process.env.DATABASE_PATH || './analyses.db';
const db = new sqlite3.Database(dbPath);

// Promisificar métodos do SQLite para usar async/await
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Inicializar banco de dados
export async function initializeDatabase() {
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        commit_sha TEXT NOT NULL,
        commit_message TEXT NOT NULL,
        author TEXT NOT NULL,
        repository TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        analysis_content TEXT NOT NULL,
        status TEXT DEFAULT 'Completed',
        commit_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

// Salvar análise no banco
export async function saveAnalysis(analysisData) {
  try {
    const {
      commit_sha,
      commit_message,
      author,
      repository,
      timestamp,
      analysis_content,
      status = 'Completed',
      commit_url
    } = analysisData;

    const result = await dbRun(`
      INSERT INTO analyses (
        commit_sha, commit_message, author, repository, 
        timestamp, analysis_content, status, commit_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [commit_sha, commit_message, author, repository, timestamp, analysis_content, status, commit_url]);

    console.log(`✅ Análise salva no banco com ID: ${result.lastID}`);
    return result.lastID;
  } catch (error) {
    console.error('❌ Erro ao salvar análise:', error);
    throw error;
  }
}

// Buscar todas as análises
export async function getAllAnalyses(limit = 50) {
  try {
    const analyses = await dbAll(`
      SELECT * FROM analyses 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [limit]);

    return analyses.map(analysis => ({
      id: analysis.id.toString(),
      commitSha: analysis.commit_sha,
      commitMessage: analysis.commit_message,
      author: analysis.author,
      repository: analysis.repository,
      timestamp: analysis.timestamp,
      analysisContent: analysis.analysis_content,
      status: analysis.status,
      commitUrl: analysis.commit_url
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar análises:', error);
    throw error;
  }
}

// Buscar análise por ID
export async function getAnalysisById(id) {
  try {
    const analysis = await dbGet(`
      SELECT * FROM analyses WHERE id = ?
    `, [id]);

    if (!analysis) return null;

    return {
      id: analysis.id.toString(),
      commitSha: analysis.commit_sha,
      commitMessage: analysis.commit_message,
      author: analysis.author,
      repository: analysis.repository,
      timestamp: analysis.timestamp,
      analysisContent: analysis.analysis_content,
      status: analysis.status,
      commitUrl: analysis.commit_url
    };
  } catch (error) {
    console.error('❌ Erro ao buscar análise por ID:', error);
    throw error;
  }
}

// Fechar conexão do banco (para testes ou shutdown)
export function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('❌ Erro ao fechar banco:', err);
        reject(err);
      } else {
        console.log('✅ Banco de dados fechado');
        resolve();
      }
    });
  });
}

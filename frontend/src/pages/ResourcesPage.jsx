cat > /home/claude/it3030-paf-2026-smart-campus-groupXX/frontend/src/pages/ResourcesPage.jsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resourceService } from '../services/resourceService';
import ResourceCard from '../components/resource/ResourceCard';
import ResourceForm from '../components/resource/ResourceForm';
import ResourceFilters from '../components/resource/ResourceFilters';

/**
 * ResourcesPage — Member 1 (Sarada) responsibility.
 * Main page for Module A: Facilities & Assets Catalogue.
 *
 * HOW IT WORKS:
 *  1. On mount → calls resourceService.getAll() → backend GET /api/resources
 *  2. User applies filters → calls resourceService.search(params) → GET /api/resources?type=...
 *  3. Admin clicks "Add Resource" → shows ResourceForm modal
 *  4. Admin edits/deletes → calls update/delete functions
 */
function ResourcesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null); // null = creating new

  // Filter state
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    location: '',
    minCapacity: '',
  });

  // ── Fetch resources (with optional filters) ──────────────────────
  async function fetchResources(activeFilters) {
    setLoading(true);
    setError('');
    try {
      // Remove empty filter values before sending
      const cleanFilters = Object.fromEntries(
        Object.entries(activeFilters || filters).filter(([_, v]) => v !== '')
      );
      const hasFilters = Object.keys(cleanFilters).length > 0;
      const response = hasFilters
        ? await resourceService.search(cleanFilters)
        : await resourceService.getAll();

      setResources(response.data);
    } catch (err) {
      setError('Failed to load resources. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  // ── Load on first render ─────────────────────────────────────────
  useEffect(() => {
    fetchResources({});
  }, []);

  // ── Handle filter change ─────────────────────────────────────────
  function handleFilterChange(newFilters) {
    setFilters(newFilters);
    fetchResources(newFilters);
  }

  // ── Handle resource created or updated ───────────────────────────
  function handleFormSuccess() {
    setShowForm(false);
    setEditingResource(null);
    fetchResources(filters); // refresh list
  }

  // ── Handle status toggle (ACTIVE ↔ OUT_OF_SERVICE) ──────────────
  async function handleToggleStatus(resource) {
    const newStatus = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    try {
      await resourceService.updateStatus(resource.id, newStatus);
      fetchResources(filters);
    } catch (err) {
      alert('Failed to update status.');
    }
  }

  // ── Handle delete ────────────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await resourceService.delete(id);
      fetchResources(filters);
    } catch (err) {
      alert('Failed to delete resource.');
    }
  }

  // ── Open edit form ───────────────────────────────────────────────
  function handleEdit(resource) {
    setEditingResource(resource);
    setShowForm(true);
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#1a73e8', margin: 0 }}>
            🏛️ Resource Catalogue
          </h1>
          <p style={{ color: '#666', margin: '4px 0 0', fontSize: '0.95rem' }}>
            Browse campus facilities and assets
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditingResource(null); setShowForm(true); }}
            style={{
              backgroundColor: '#1a73e8', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.95rem'
            }}
          >
            + Add Resource
          </button>
        )}
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <ResourceFilters filters={filters} onChange={handleFilterChange} />

      {/* ── Content ─────────────────────────────────────────────── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          Loading resources...
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fff5f5', border: '1px solid #feb2b2',
          borderRadius: '8px', padding: '1rem', color: '#c53030', marginBottom: '1rem'
        }}>
          ❌ {error}
        </div>
      )}

      {!loading && !error && resources.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
          <p>No resources found. {isAdmin && 'Click "Add Resource" to create one.'}</p>
        </div>
      )}

      {!loading && !error && resources.length > 0 && (
        <>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Showing {resources.length} resource{resources.length !== 1 ? 's' : ''}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.2rem'
          }}>
            {resources.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────────── */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '2rem', maxWidth: '560px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#1a73e8' }}>
                {editingResource ? '✏️ Edit Resource' : '+ New Resource'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditingResource(null); }}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}
              >
                ✕
              </button>
            </div>
            <ResourceForm
              existing={editingResource}
              onSuccess={handleFormSuccess}
              onCancel={() => { setShowForm(false); setEditingResource(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourcesPage;
EOF


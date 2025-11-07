import React, { useState, useRef, useEffect } from 'react';

interface EntityTableProps<T> {
  entities: T[];
  filteredEntities: T[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedIds: number[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectEntity: (id: number) => void;
  onView: (entity: T) => void;
  onEdit: (entity: T) => void;
  onDelete: (id: number, name: string) => void;
  getEntityId: (entity: T) => number;
  getEntityName: (entity: T) => string;
  truncateText: (text: string, maxLength?: number) => string;
  columns: Array<{
    key: string;
    label: string;
    render: (entity: T) => React.ReactNode;
    sortable?: boolean;
    maxLength?: number;
  }>;
  emptyMessage: string;
  emptySearchMessage: string;
  selectAllLabel: string;
  showSearch?: boolean;
  customActions?: (entity: T) => React.ReactNode;
}

export function EntityTable<T>({
  entities,
  filteredEntities,
  searchTerm,
  onSearchChange,
  selectedIds,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onSelectEntity,
  onView,
  onEdit,
  onDelete,
  getEntityId,
  getEntityName,
  truncateText,
  columns,
  emptyMessage,
  emptySearchMessage,
  selectAllLabel,
  showSearch = true,
  customActions,
}: EntityTableProps<T>) {
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map(col => col.key))
  );
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const menuRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Cerrar el menú de filtros al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowColumnFilter(false);
      }
      
      // Cerrar menús de acciones
      let clickedInsideMenu = false;
      menuRefs.current.forEach((ref) => {
        if (ref && ref.contains(event.target as Node)) {
          clickedInsideMenu = true;
        }
      });
      
      if (!clickedInsideMenu) {
        setOpenMenuId(null);
      }
    };

    if (showColumnFilter || openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnFilter, openMenuId]);

  const toggleColumn = (columnKey: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnKey) && newVisible.size > 1) {
      newVisible.delete(columnKey);
    } else if (!newVisible.has(columnKey)) {
      newVisible.add(columnKey);
    }
    setVisibleColumns(newVisible);
  };

  const visibleColumnsList = columns.filter(col => visibleColumns.has(col.key));

  return (
    <div className="table-container">
      {showSearch && (
        <div className="table-controls">
          <div className="search-container">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="search-icon-emoji"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}
            >
              <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button 
              className="filter-button" 
              aria-label="Filtros de columnas"
              onClick={() => setShowColumnFilter(!showColumnFilter)}
              style={{ backgroundColor: showColumnFilter ? '#2d2d2d' : 'transparent' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            {showColumnFilter && (
              <div className="column-filter-menu">
                <div className="column-filter-header">
                  <strong>Mostrar columnas</strong>
                </div>
                <div className="column-filter-list">
                  {columns.map((column) => (
                    <label key={column.key} className="column-filter-item">
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(column.key)}
                        onChange={() => toggleColumn(column.key)}
                        disabled={visibleColumns.size === 1 && visibleColumns.has(column.key)}
                      />
                      <span>{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {entities.length === 0 ? (
        <div className="empty-state">
          <p>{emptyMessage}</p>
        </div>
      ) : filteredEntities.length === 0 ? (
        <div className="empty-state">
          <p>{emptySearchMessage}</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={onSelectAll}
                  aria-label={selectAllLabel}
                />
              </th>
              {visibleColumnsList.map((column) => (
                <th key={column.key}>
                  {column.label}
                </th>
              ))}
              <th className="actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntities.map((entity) => {
              const entityId = getEntityId(entity);
              const entityName = getEntityName(entity);
              return (
                <tr key={entityId}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(entityId)}
                      onChange={() => onSelectEntity(entityId)}
                      aria-label={`Seleccionar ${entityName}`}
                    />
                  </td>
                  {visibleColumnsList.map((column) => {
                    const rendered = column.maxLength
                      ? truncateText(String(column.render(entity)), column.maxLength)
                      : column.render(entity);
                    const isIconCell = React.isValidElement(rendered) && 
                      rendered.type === 'div' && 
                      (rendered.props as any)?.style?.display === 'flex';
                    return (
                      <td 
                        key={column.key}
                        style={isIconCell ? { whiteSpace: 'normal' } : undefined}
                      >
                        {rendered}
                      </td>
                    );
                  })}
                  <td className="actions-column">
                      <div 
                        className="actions-menu-container"
                        ref={(el) => {
                          if (el) {
                            menuRefs.current.set(entityId, el);
                          } else {
                            menuRefs.current.delete(entityId);
                          }
                        }}
                      >
                        <button
                          className="actions-menu-trigger"
                          onClick={() => setOpenMenuId(openMenuId === entityId ? null : entityId)}
                          aria-label={`Acciones para ${entityName}`}
                          aria-expanded={openMenuId === entityId}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="4" r="1.5" fill="currentColor"/>
                            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                            <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
                          </svg>
                        </button>
                        {openMenuId === entityId && (
                          <div className="actions-menu">
                            {customActions && (
                              <div 
                                className="actions-menu-item-wrapper"
                                onClick={() => setOpenMenuId(null)}
                              >
                                {customActions(entity)}
                              </div>
                            )}
                            <button
                              className="actions-menu-item btn-view"
                              onClick={() => {
                                onView(entity);
                                setOpenMenuId(null);
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 3C4.66667 3 2 5.33333 1.33333 8C2 10.6667 4.66667 13 8 13C11.3333 13 14 10.6667 14.6667 8C14 5.33333 11.3333 3 8 3ZM8 11.3333C6.53333 11.3333 5.33333 10.1333 5.33333 8.66667C5.33333 7.2 6.53333 6 8 6C9.46667 6 10.6667 7.2 10.6667 8.66667C10.6667 10.1333 9.46667 11.3333 8 11.3333ZM8 7.33333C7.26667 7.33333 6.66667 7.93333 6.66667 8.66667C6.66667 9.4 7.26667 10 8 10C8.73333 10 9.33333 9.4 9.33333 8.66667C9.33333 7.93333 8.73333 7.33333 8 7.33333Z" fill="currentColor"/>
                              </svg>
                              <span>Ver</span>
                            </button>
                            <button
                              className="actions-menu-item btn-edit"
                              onClick={() => {
                                onEdit(entity);
                                setOpenMenuId(null);
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.3333 2.66667C11.5084 2.49146 11.7163 2.35303 11.9441 2.26014C12.1719 2.16726 12.4151 2.12183 12.66 2.12667C12.9049 2.13151 13.1461 2.18652 13.3699 2.28853C13.5937 2.39054 13.7955 2.5374 13.9627 2.72067C14.1299 2.90394 14.2591 3.11987 14.3424 3.35482C14.4257 3.58977 14.4613 3.83899 14.4467 4.08667C14.4321 4.33435 14.3676 4.5756 14.2573 4.79467L6.11333 13.3333L2 14.6667L3.33333 10.5533L11.4867 2.01333L11.3333 2.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                              </svg>
                              <span>Editar</span>
                            </button>
                            <button
                              className="actions-menu-item btn-delete"
                              onClick={() => {
                                onDelete(entityId, entityName);
                                setOpenMenuId(null);
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 4H14M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33333 13.687 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2.31305 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31305 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span>Borrar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      )}
    </div>
  );
}


import React from 'react';
import { GroupDocuments } from './call-twilio/components/GroupDocuments';

export const GroupDocumentsContent = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Documentos de Grupos</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona y visualiza todos los documentos cargados por grupo
            </p>
          </div>
        </div>
        
        <GroupDocuments />
      </div>
    </div>
  );
};

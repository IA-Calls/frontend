import { Button } from "./ui/button.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog.tsx"
import { AlertTriangle, Trash2 } from "lucide-react"

export function DeleteGroupModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  groupName = '',
  isLoading = false 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[425px] bg-white dark:bg-gray-800" 
        style={{ 
          zIndex: 9999,
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--tw-bg-opacity, 1)',
          border: '1px solid var(--tw-border-opacity, 1)',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Esta acción no se puede deshacer. El grupo será eliminado permanentemente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <Trash2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                ¿Estás seguro de que quieres eliminar el grupo?
              </p>
              {groupName && (
                <p className="text-gray-900 dark:text-white font-semibold mt-1">
                  "{groupName}"
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Esta acción eliminará permanentemente el grupo y todos sus datos asociados.
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Grupo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
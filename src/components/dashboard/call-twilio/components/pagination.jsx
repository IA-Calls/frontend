"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "./ui/button.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"

export function Pagination({ currentPage, totalPages, totalUsers, onPageChange, disabled = false }) {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && !disabled) {
      onPageChange(page)
    }
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-600 bg-white border border-gray-200 rounded-lg p-4">
        Total: {totalUsers} usuarios
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            Página {currentPage} de {totalPages} • Total: {totalUsers} usuarios
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Ir a primera página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || disabled}
            className="border-gray-300"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Página anterior */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || disabled}
            className="border-gray-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Páginas numeradas */}
          <div className="flex items-center gap-1">
            {getVisiblePages().map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="px-2 py-1 text-gray-500">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    disabled={disabled}
                    className={`min-w-[40px] ${
                      currentPage === page 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "border-gray-300"
                    }`}
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Página siguiente */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || disabled}
            className="border-gray-300"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Ir a última página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || disabled}
            className="border-gray-300"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Selector de página rápido */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Ir a:</span>
          <Select
            value={currentPage.toString()}
            onValueChange={(value) => handlePageChange(Number.parseInt(value))}
            disabled={disabled}
          >
            <SelectTrigger className="w-20 border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <SelectItem key={page} value={page.toString()}>
                  {page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

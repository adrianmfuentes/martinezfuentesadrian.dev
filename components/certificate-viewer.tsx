"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, X, ZoomIn, ZoomOut, ExternalLink } from "lucide-react"
import { usePdfViewerLogic } from "../app/actions/pdfViewerLogic"

import "react-pdf/dist/Page/AnnotationLayer.js"
import "react-pdf/dist/Page/TextLayer.js"

// Configura la ruta al worker de pdf.js usando el archivo local
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`

interface CertificateViewerProps {
  pdfUrl: string
  title: string
  isOpen: boolean
  onClose: () => void
}

// Componente para los controles del header
function ViewerHeader({ title, isMobile, scale, zoomIn, zoomOut, onClose, pdfUrl }: Readonly<{
  title: string
  isMobile: boolean
  scale: number
  zoomIn: () => void
  zoomOut: () => void
  onClose: () => void
  pdfUrl: string
}>) {
  const openInNewTab = () => {
    window.open(pdfUrl, '_blank')
  }

  return (
    <DialogHeader className={`flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
      isMobile ? 'flex-row p-3 gap-2' : 'flex-col sm:flex-row p-3 sm:p-4 gap-2 sm:gap-0'
    }`}>
      <DialogTitle className={`font-semibold font-poppins truncate ${
        isMobile ? 'text-sm flex-1 pr-2' : 'text-base sm:text-lg pr-2 sm:pr-4 w-full sm:w-auto'
      }`}>
        {title}
      </DialogTitle>
      
      <div className={`flex items-center ${
        isMobile ? 'gap-1' : 'gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end'
      }`}>
        {/* Controles de zoom - solo en desktop */}
        {!isMobile && (
          <>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={zoomOut} disabled={scale <= 0.3}>
                <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground px-1 sm:px-2 min-w-[45px] sm:min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button variant="ghost" size="sm" onClick={zoomIn} disabled={scale >= 3}>
                <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
            
            <div className="w-px h-4 sm:h-6 bg-border mx-1 sm:mx-2" />
          </>
        )}

        {/* Botón para abrir en nueva pestaña - solo en móvil */}
        {isMobile && (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={openInNewTab}
              className="text-xs px-2"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Abrir
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
          </>
        )}
        
        {/* Botón de cerrar */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClose}
          className={`hover:bg-destructive hover:text-destructive-foreground border-destructive/30 text-destructive hover:border-destructive ${
            isMobile ? 'text-xs px-2' : 'text-xs sm:text-sm px-2 sm:px-3'
          }`}
        >
          <X className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3 sm:h-4 sm:w-4 sm:mr-1'}`} />
          <span className={`${isMobile ? 'ml-1' : 'hidden sm:inline'}`}>
            Cerrar
          </span>
        </Button>
      </div>
    </DialogHeader>
  )
}

// Componente para los controles de navegación
function NavigationControls({ numPages, pageNumber, goToPrevPage, goToNextPage, isMobile }: Readonly<{
  numPages: number | null
  pageNumber: number
  goToPrevPage: () => void
  goToNextPage: () => void
  isMobile: boolean
}>) {
  if (!numPages || numPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 p-3 sm:p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={goToPrevPage} 
        disabled={pageNumber <= 1}
        className="gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className={`${isMobile ? 'inline' : 'hidden xs:inline'}`}>
          {isMobile ? 'Anterior' : 'Ant.'}
        </span>
        <span className="hidden sm:inline">erior</span>
      </Button>
      
      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-muted rounded-md text-xs sm:text-sm">
        <span className="font-medium">
          {pageNumber}
        </span>
        <span className="text-muted-foreground">
          de {numPages}
        </span>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={goToNextPage} 
        disabled={pageNumber >= numPages}
        className="gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm"
      >
        <span className={`${isMobile ? 'inline' : 'hidden xs:inline'}`}>
          {isMobile ? 'Siguiente' : 'Sig.'}
        </span>
        <span className="hidden sm:inline">uiente</span>
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  )
}

export function CertificateViewer({ pdfUrl, title, isOpen, onClose }: Readonly<CertificateViewerProps>) {
  const {
    numPages,
    pageNumber,
    scale,
    needsScroll,
    isMobile,
    containerWidth,
    containerRef,
    pageRef,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
    goToPrevPage,
    goToNextPage,
    zoomIn,
    zoomOut
  } = usePdfViewerLogic()

  const openInNewTab = () => {
    window.open(pdfUrl, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-7xl p-0 overflow-hidden [&>button]:hidden ${
        isMobile 
          ? 'w-[95vw] h-auto max-h-[90vh]' 
          : 'w-[98vw] sm:w-[95vw] md:w-[90vw] lg:w-[85vw] xl:w-[80vw] h-[95vh] sm:h-[90vh] md:h-[88vh]'
      }`}>
        <ViewerHeader 
          title={title}
          isMobile={isMobile}
          scale={scale}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          onClose={onClose}
          pdfUrl={pdfUrl}
        />

        {/* Contenedor del PDF */}
        <div className={`flex flex-col ${isMobile ? 'min-h-0' : 'flex-1 min-h-0'}`}>
          <div 
            ref={containerRef}
            className={(() => {
              if (isMobile) {
                return 'transition-all duration-200 p-2 flex justify-center overflow-hidden'
              }
              const overflowClass = needsScroll 
                ? 'overflow-auto' 
                : 'overflow-hidden flex items-center justify-center'
              return `transition-all duration-200 flex-1 min-h-0 ${overflowClass} p-2 sm:p-4`
            })()}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className={`flex flex-col items-center justify-center space-y-3 sm:space-y-4 ${
                  isMobile ? 'h-32' : 'h-48 sm:h-64'
                }`}>
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                  <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">
                    Cargando certificado...
                  </p>
                </div>
              }
              error={
                <div className={`flex flex-col items-center justify-center space-y-3 sm:space-y-4 ${
                  isMobile ? 'h-32' : 'h-48 sm:h-64'
                }`}>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <X className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-xs sm:text-sm font-medium text-destructive">
                      Error al cargar el certificado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Por favor, inténtalo más tarde
                    </p>
                    {isMobile && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={openInNewTab}
                        className="mt-2 text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Abrir en navegador
                      </Button>
                    )}
                  </div>
                </div>
              }
              className="flex justify-center w-full"
            >
              <div 
                ref={pageRef}
                className={`shadow-lg sm:shadow-2xl rounded-md sm:rounded-lg overflow-hidden border sm:border-2 bg-white ${
                  !isMobile && needsScroll ? 'my-2 sm:my-4' : ''
                }`}
              >
                <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  scale={isMobile ? undefined : scale}
                  width={isMobile ? Math.max(containerWidth - 16, 300) : undefined}
                  className="block"
                  onLoadSuccess={onPageLoadSuccess}
                />
              </div>
            </Document>
          </div>

          <NavigationControls 
            numPages={numPages}
            pageNumber={pageNumber}
            goToPrevPage={goToPrevPage}
            goToNextPage={goToNextPage}
            isMobile={isMobile}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
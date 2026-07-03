import { useState, useRef, useEffect, useCallback } from "react"

export function usePdfViewerLogic() {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(0.8)
  const [needsScroll, setNeedsScroll] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  // Función para verificar si necesita scroll
  const checkScrollNeeded = useCallback(() => {
    if (!isMobile && containerRef.current && pageRef.current) {
      const container = containerRef.current
      const page = pageRef.current
      
      const containerHeight = container.clientHeight
      const pageHeight = page.scrollHeight
      
      setNeedsScroll(pageHeight > containerHeight - 32)
    }
  }, [isMobile])

  // Detectar si es móvil y configurar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
      
      if (!mobile) {
        if (window.innerWidth < 1024) {
          setScale(0.6)
        } else {
          setScale(0.8)
        }
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Actualizar ancho del contenedor cuando cambie
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width)
        }
      })
      
      resizeObserver.observe(containerRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [])

  // Verificar scroll cuando cambia el scale
  useEffect(() => {
    const timer = setTimeout(checkScrollNeeded, 100)
    return () => clearTimeout(timer)
  }, [scale, pageNumber, checkScrollNeeded])

  // Verificar scroll cuando se redimensiona la ventana
  useEffect(() => {
    const handleResize = () => {
      checkScrollNeeded()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [checkScrollNeeded])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const onPageLoadSuccess = useCallback(() => {
    checkScrollNeeded()
  }, [checkScrollNeeded])

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1))
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages || 1))
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3))
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.3))

  return {
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
  }
}

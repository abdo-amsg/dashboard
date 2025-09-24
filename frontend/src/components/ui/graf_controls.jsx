import { LinkIcon, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "./button"

export default function GraphControls({ onZoomIn, onZoomOut, onResetZoom, onResetView, isFilteredView }) {
  return (
    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 p-2 flex flex-col gap-2 z-10">
      <Button onClick={onZoomIn} variant="ghost" size="sm" className="h-9 w-9 p-0" title="Zoom In">
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button onClick={onZoomOut} variant="ghost" size="sm" className="h-9 w-9 p-0" title="Zoom Out">
        <ZoomOut className="w-4 h-4" />
      </Button>
      <Button onClick={onResetZoom} variant="ghost" size="sm" className="h-9 w-9 p-0" title="Reset Zoom">
        <RotateCcw className="w-4 h-4" />
      </Button>
      {isFilteredView ? (
        <Button onClick={onResetView} variant="outline" size="sm" className="h-9 w-9 p-0" title="Reset View">
          <LinkIcon className="w-4 h-4" />
        </Button>
      ) : (
        <Button  variant="outline" size="sm" className="h-9 w-9 p-0" title="Reset View" disabled >
          <LinkIcon className="w-4 h-4 " />
        </Button>
      )
    }
    </div>
  )
}
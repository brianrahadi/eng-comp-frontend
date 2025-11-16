import { useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import type { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import type { Camera } from "../api/types";
import CameraTooltip from "./CameraTooltip";

const SCALE_FACTOR = 200;

function getNodeColor(status: Camera["Status"]): string {
  if (status === "WARNING") return "#fca5a5";
  if (status === "LOWLIGHT") return "#fde68a";
  return "#86efac";
}

interface MapViewProps {
  cameras: Camera[];
  selectedSegmentId?: number | null;
  onSegmentSelect?: (segmentId: number | null) => void;
  isPlaybackMode?: boolean;
}

export default function MapView({
  cameras,
  selectedSegmentId = null,
  onSegmentSelect,
  isPlaybackMode = false,
}: MapViewProps) {
  const [hoverId, setHoverId] = useState<number | null>(null);

  const bounds = useMemo(() => {
    if (!cameras.length) {
      return { minX: -5, maxX: 10, minY: -5, maxY: 10 };
    }
    const xCoords = cameras.map((c) => c.Position[0]);
    const yCoords = cameras.map((c) => c.Position[1]);
    const padding = 2;
    return {
      minX: Math.floor(Math.min(...xCoords)) - padding,
      maxX: Math.ceil(Math.max(...xCoords)) + padding,
      minY: Math.floor(Math.min(...yCoords)) - padding,
      maxY: Math.ceil(Math.max(...yCoords)) + padding,
    };
  }, [cameras]);

  const axisNodes = useMemo<Node[]>(() => {
    return [
      {
        id: "axis-origin",
        position: { x: 0, y: 0 },
        data: {},
        style: { width: 0, height: 0, opacity: 0 },
        selectable: false,
        draggable: false,
      },
      {
        id: "axis-x-end",
        position: { x: bounds.maxX * SCALE_FACTOR, y: 0 },
        data: {},
        style: { width: 0, height: 0, opacity: 0 },
        selectable: false,
        draggable: false,
      },
      {
        id: "axis-x-start",
        position: { x: bounds.minX * SCALE_FACTOR, y: 0 },
        data: {},
        style: { width: 0, height: 0, opacity: 0 },
        selectable: false,
        draggable: false,
      },
      {
        id: "axis-y-end",
        position: { x: 0, y: bounds.maxY * SCALE_FACTOR },
        data: {},
        style: { width: 0, height: 0, opacity: 0 },
        selectable: false,
        draggable: false,
      },
      {
        id: "axis-y-start",
        position: { x: 0, y: bounds.minY * SCALE_FACTOR },
        data: {},
        style: { width: 0, height: 0, opacity: 0 },
        selectable: false,
        draggable: false,
      },
    ];
  }, [bounds]);

  const gridEdges = useMemo<Edge[]>(() => {
    const edges: Edge[] = [];
    
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      if (x === 0) continue;
      edges.push({
        id: `grid-v-${x}`,
        source: `grid-${x}-${bounds.minY}`,
        target: `grid-${x}-${bounds.maxY}`,
        type: "straight",
        style: {
          stroke: "#cbd5e1",
          strokeWidth: 1,
          strokeDasharray: "4,4",
        },
        deletable: false,
      });
    }

    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      if (y === 0) continue;
      edges.push({
        id: `grid-h-${y}`,
        source: `grid-${bounds.minX}-${y}`,
        target: `grid-${bounds.maxX}-${y}`,
        type: "straight",
        style: {
          stroke: "#cbd5e1",
          strokeWidth: 1,
          strokeDasharray: "4,4",
        },
        deletable: false,
      });
    }

    return edges;
  }, [bounds]);

  const gridNodes = useMemo<Node[]>(() => {
    const nodes: Node[] = [];
    
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      for (let y = bounds.minY; y <= bounds.maxY; y++) {
        if (
          (x === bounds.minX || x === bounds.maxX) ||
          (y === bounds.minY || y === bounds.maxY)
        ) {
          nodes.push({
            id: `grid-${x}-${y}`,
            position: {
              x: x * SCALE_FACTOR,
              y: y * SCALE_FACTOR,
            },
            data: {},
            style: { width: 0, height: 0, opacity: 0 },
            selectable: false,
            draggable: false,
          });
        }
      }
    }

    return nodes;
  }, [bounds]);

  const axisEdges = useMemo<Edge[]>(() => {
    return [
      {
        id: "axis-x",
        source: "axis-x-start",
        target: "axis-x-end",
        type: "straight",
        style: {
          stroke: "#94a3b8",
          strokeWidth: 2,
        },
        deletable: false,
      },
      {
        id: "axis-y",
        source: "axis-y-start",
        target: "axis-y-end",
        type: "straight",
        style: {
          stroke: "#94a3b8",
          strokeWidth: 2,
        },
        deletable: false,
      },
    ];
  }, []);

  const nodes = useMemo<Node[]>(
    () =>
      cameras.map((c) => ({
        id: c.SegmentID.toString(),
        position: {
          x: c.Position[0] * SCALE_FACTOR,
          y: c.Position[1] * SCALE_FACTOR,
        },
        data: { label: `Seg ${c.SegmentID}` },
        style: {
          background: getNodeColor(c.Status),
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: selectedSegmentId === c.SegmentID ? "3px solid #3b82f6" : "2px solid #333",
          color: "#000",
          fontWeight: "500",
          fontSize: "12px",
          transition: isPlaybackMode ? "background 0.3s ease, border 0.3s ease" : "none",
        },
      })),
    [cameras, selectedSegmentId, isPlaybackMode]
  );

  const allNodes = useMemo(() => [...axisNodes, ...gridNodes, ...nodes], [axisNodes, gridNodes, nodes]);
  const allEdges = useMemo(() => [...axisEdges, ...gridEdges], [axisEdges, gridEdges]);

  const [nodesState, setNodes, onNodesChange] = useNodesState(allNodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(allEdges);

  useEffect(() => {
    setNodes(allNodes);
  }, [allNodes, setNodes]);

  useEffect(() => {
    setEdges(allEdges);
  }, [allEdges, setEdges]);

  const hoveredCam =
    hoverId != null ? cameras.find((c) => c.SegmentID === hoverId) : null;

  return (
    <div className="relative h-[600px] w-full border rounded-lg bg-gray-50">
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={(_, node) => {
          const id = Number(node.id);
          if (!isNaN(id)) {
            setHoverId(id);
          }
        }}
        onNodeMouseLeave={() => setHoverId(null)}
        onNodeClick={(_, node) => {
          const id = Number(node.id);
          if (!isNaN(id) && onSegmentSelect) {
            onSegmentSelect(id === selectedSegmentId ? null : id);
          }
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background gap={20} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {hoveredCam && (
        <div className="absolute left-4 top-4 z-10">
          <CameraTooltip cam={hoveredCam} />
        </div>
      )}
    </div>
  );
}


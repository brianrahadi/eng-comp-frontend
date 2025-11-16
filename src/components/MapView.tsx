import { useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Camera } from "../api/types";
import CameraTooltip from "./CameraTooltip";

const SCALE_FACTOR = 200;

function getNodeColor(status: Camera["Status"]): string {
  if (status === "WARNING") return "#fca5a5";
  if (status === "LOWLIGHT") return "#fde68a";
  return "#86efac";
}

export default function MapView({ cameras }: { cameras: Camera[] }) {
  const [hoverId, setHoverId] = useState<number | null>(null);

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
          borderRadius: "8px",
          padding: "12px",
          border: "2px solid #333",
          color: "#000",
          fontWeight: "500",
        },
      })),
    [cameras]
  );

  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes);

  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  const hoveredCam =
    hoverId != null ? cameras.find((c) => c.SegmentID === hoverId) : null;

  return (
    <div className="relative h-[600px] w-full border rounded-lg bg-gray-50">
      <ReactFlow
        nodes={nodesState}
        edges={[]}
        onNodesChange={onNodesChange}
        onNodeMouseEnter={(_, node) => setHoverId(Number(node.id))}
        onNodeMouseLeave={() => setHoverId(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
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


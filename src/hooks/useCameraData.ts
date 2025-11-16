import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCameras } from "../api/cameraService";
import type { Camera } from "../api/types";
import { useWebSocket } from "./useWebSocket";
import { useCallback } from "react";

export function useCameraData() {
  const queryClient = useQueryClient();
  
  const query = useQuery<Camera[]>({
    queryKey: ["cameras"],
    queryFn: getCameras,
    staleTime: 5000,
    refetchInterval: 30000,
  });

  const onWebSocketMessage = useCallback(
    (data: Camera[]) => {
      queryClient.setQueryData(["cameras"], data);
    },
    [queryClient]
  );

  useWebSocket(onWebSocketMessage);

  return query;
}


import { io, type Socket } from "socket.io-client";
import { useEffect, useRef } from "react";
import type { QueryClient } from "@tanstack/react-query";
import type { VmRecord } from "@/lib/api";

const SOCKET_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000";

type VmRealtimeEvent = "vm:created" | "vm:updated" | "vm:deleted";

type VmRealtimePayload = VmRecord;

type Options = {
  onEvent?: (eventName: VmRealtimeEvent, vm: VmRecord) => void;
};

type VmListCache = { data?: VmRecord[]; total: number } | undefined;

function updateVmList(
  queryClient: QueryClient,
  nextData: (current: VmRecord[] | undefined) => VmRecord[] | undefined,
) {
  queryClient.setQueryData(["vms", "list"], (currentData: VmListCache) => {
    if (!currentData) return currentData;

    const data = nextData(currentData.data);
    if (!data) {
      return {
        ...currentData,
        data,
        total: currentData.total,
      };
    }

    return {
      ...currentData,
      data,
      total: data.length,
    };
  });
}

function prependVm(current: VmRecord[] | undefined, vm: VmRecord) {
  const items = current ?? [];
  return [vm, ...items.filter((item) => item.id !== vm.id)];
}

function replaceVm(current: VmRecord[] | undefined, vm: VmRecord) {
  const items = current ?? [];
  const exists = items.some((item) => item.id === vm.id);
  if (!exists) {
    return [vm, ...items];
  }

  return items.map((item) => (item.id === vm.id ? vm : item));
}

function removeVm(current: VmRecord[] | undefined, vmId: string) {
  return (current ?? []).filter((item) => item.id !== vmId);
}

export function useVmRealtime(queryClient: QueryClient, options: Options = {}) {
  const onEventRef = useRef(options.onEvent);

  useEffect(() => {
    onEventRef.current = options.onEvent;
  }, [options.onEvent]);

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const handleCreated = (vm: VmRealtimePayload) => {
      updateVmList(queryClient, (current) => prependVm(current, vm));
      onEventRef.current?.("vm:created", vm);
    };

    const handleUpdated = (vm: VmRealtimePayload) => {
      updateVmList(queryClient, (current) => replaceVm(current, vm));
      onEventRef.current?.("vm:updated", vm);
    };

    const handleDeleted = (vm: VmRealtimePayload) => {
      updateVmList(queryClient, (current) => removeVm(current, vm.id));
      onEventRef.current?.("vm:deleted", vm);
    };

    socket.on("vm:created", handleCreated);
    socket.on("vm:updated", handleUpdated);
    socket.on("vm:deleted", handleDeleted);

    return () => {
      socket.off("vm:created", handleCreated);
      socket.off("vm:updated", handleUpdated);
      socket.off("vm:deleted", handleDeleted);
      socket.disconnect();
    };
  }, [queryClient]);
}

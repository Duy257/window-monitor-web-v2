import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { queryKeys } from "../api/queryKeys";
import type { FileEntry } from "../types/api";

/** Liệt kê nội dung thư mục */
export function useListDir(dirPath: string | null) {
  return useQuery<FileEntry[]>({
    queryKey: queryKeys.files.list(dirPath),
    queryFn: async () => {
      const { data } = await apiClient.get("/files", {
        params: { path: dirPath },
      });
      return data.data;
    },
    enabled: !!dirPath,
    staleTime: 5000,
  });
}

/** Đọc nội dung file text */
export function useReadFile(filePath: string | null) {
  return useQuery<{ path: string; size: number; content: string }>({
    queryKey: queryKeys.files.read(filePath),
    queryFn: async () => {
      const { data } = await apiClient.get("/files/read", {
        params: { path: filePath },
      });
      return data.data;
    },
    enabled: !!filePath,
    staleTime: 10000,
  });
}

/** Xóa file hoặc thư mục (cần quyền admin) */
export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetPath: string) =>
      apiClient.delete("/files", { params: { path: targetPath } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.files.all() }),
  });
}

/** Tạo thư mục mới (cần quyền admin) */
export function useCreateDir() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dirPath: string) =>
      apiClient.post("/files/mkdir", { path: dirPath }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.files.all() }),
  });
}

/** Di chuyển / đổi tên file (cần quyền admin) */
export function useMoveFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) =>
      apiClient.put("/files/move", { from, to }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.files.all() }),
  });
}

/**
 * Download file an toàn — API key nằm trong header (không lộ qua URL)
 * Sử dụng blob download thay vì truyền key qua query string
 */
export async function downloadFile(filePath: string): Promise<void> {
  const response = await apiClient.get("/files/download", {
    params: { path: filePath },
    responseType: "blob",
  });
  const blob = new Blob([response.data]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filePath.split("/").pop() ?? "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

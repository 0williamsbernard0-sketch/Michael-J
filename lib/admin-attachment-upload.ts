export async function uploadAdminAttachment(
  file: File,
  folder: string,
  secret: string
): Promise<{ attachmentUrl: string; attachmentName: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/admin/upload-attachment", {
    method: "POST",
    headers: { "x-admin-secret": secret },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Upload failed.");
  }
  return { attachmentUrl: data.attachmentUrl, attachmentName: data.attachmentName };
}

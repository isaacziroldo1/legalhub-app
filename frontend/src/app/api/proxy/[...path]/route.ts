import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server-api";

type RouteContext = { params: { path: string[] } };

async function toNextResponse(response: Response) {
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  }

  const headers = new Headers();
  const disposition = response.headers.get("content-disposition");
  if (disposition) headers.set("content-disposition", disposition);
  if (contentType) headers.set("content-type", contentType);

  const body = await response.arrayBuffer();
  return new NextResponse(body, { status: response.status, headers });
}

async function proxyRequest(request: NextRequest, pathSegments: string[], method: string) {
  const path = `/${pathSegments.join("/")}`;
  const query = request.nextUrl.search;
  const targetPath = `${path}${query}`;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const response = await backendFetch(targetPath, {
      method,
      body: formData,
    });
    return toNextResponse(response);
  }

  const body =
    method !== "GET" && method !== "DELETE" && request.headers.get("content-length") !== "0"
      ? await request.text()
      : undefined;

  const response = await backendFetch(targetPath, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body || undefined,
  });

  return toNextResponse(response);
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context.params.path, "GET");
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context.params.path, "POST");
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context.params.path, "PATCH");
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context.params.path, "DELETE");
}

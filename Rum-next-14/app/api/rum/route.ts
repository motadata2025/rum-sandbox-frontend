import { NextRequest, NextResponse } from 'next/server';

const DATADOG_INTAKE_ORIGIN = 'https://rum.browser-intake-us5-datadoghq.com';

async function proxyRequest(req: NextRequest) {
  const ddforward = req.nextUrl.searchParams.get('ddforward');

  if (!ddforward) {
    return new NextResponse('ddforward parameter is missing', { status: 400 });
  }

  // The ddforward parameter includes the path and query string
  const datadogUrl = `${DATADOG_INTAKE_ORIGIN}${ddforward}`;

  const headers = new Headers(req.headers);
  headers.set('X-Forwarded-For', req.ip || req.headers.get('x-forwarded-for') || '');
  // The host header should be the Datadog intake endpoint
  headers.set('host', new URL(DATADOG_INTAKE_ORIGIN).host);


  const response = await fetch(datadogUrl, {
    method: req.method,
    headers: headers,
    body: req.body,
    // duplex: 'half' is required for streaming request bodies
    // @ts-ignore
    duplex: 'half',
  });

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export async function POST(req: NextRequest) {
  return proxyRequest(req);
}

export async function GET(req: NextRequest) {
  return proxyRequest(req);
}

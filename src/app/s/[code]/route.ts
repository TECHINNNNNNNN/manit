/**
 * COMPONENT: Short URL Redirect Handler
 * PURPOSE: Redirect short URLs to deployed GitHub Pages sites
 * FLOW: Extract code → Lookup project → Redirect to deployment
 * DEPENDENCIES: Prisma, Next.js route handlers
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        
        if (!code) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        
        // Build the full short URL to match against database
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`;
        const shortUrl = `${baseUrl}/s/${code}`;
        
        // Find project with this short URL
        const project = await prisma.project.findUnique({
            where: { shortUrl },
            select: {
                deploymentUrl: true,
                deploymentStatus: true,
                name: true,
            }
        });
        
        if (!project) {
            // Short URL not found, redirect to home
            return NextResponse.redirect(new URL('/', request.url));
        }
        
        if (project.deploymentStatus !== 'DEPLOYED' || !project.deploymentUrl) {
            // Project not deployed yet, show message
            return new NextResponse(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${project.name} - Not Yet Deployed</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            margin: 0;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        }
                        .container {
                            text-align: center;
                            padding: 2rem;
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                            max-width: 400px;
                        }
                        h1 {
                            color: #333;
                            margin-bottom: 1rem;
                        }
                        p {
                            color: #666;
                            line-height: 1.6;
                        }
                        .status {
                            display: inline-block;
                            padding: 0.5rem 1rem;
                            background: #fef3c7;
                            color: #92400e;
                            border-radius: 6px;
                            font-weight: 500;
                            margin-top: 1rem;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>${project.name}</h1>
                        <p>This linktree is currently being deployed. Please check back in a few moments!</p>
                        <div class="status">🚀 Deploying...</div>
                    </div>
                </body>
                </html>
                `,
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/html',
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                    }
                }
            );
        }
        
        // Redirect to the deployed URL
        return NextResponse.redirect(project.deploymentUrl);
        
    } catch (error) {
        console.error('Short URL redirect error:', error);
        // On error, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
    }
}
#!/bin/bash

# This script verifies that all CI checks will pass
# Run this locally before pushing to catch issues early

set -e

echo "🔍 Running CI verification checks..."
echo ""

echo "📦 Installing dependencies..."
yarn install --frozen-lockfile
echo "✅ Dependencies installed"
echo ""

echo "🧹 Running ESLint..."
yarn lint
echo "✅ Lint passed"
echo ""

echo "🔨 Building Next.js frontend..."
yarn build
echo "✅ Frontend build passed"
echo ""

echo "🔍 Checking TypeScript types (frontend)..."
yarn tsc --noEmit
echo "✅ Frontend types passed"
echo ""

echo "🔍 Checking TypeScript types (backend)..."
yarn tsc -p tsconfig.server.json --noEmit
echo "✅ Backend types passed"
echo ""

echo "✨ All CI checks passed! Safe to push."

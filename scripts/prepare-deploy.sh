#!/bin/bash

# Script to prepare project for deployment

echo "🚀 Preparing WRE LMS for deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add remote if not exists
if ! git remote | grep -q "origin"; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/znn-cmd/LMS-wre.git
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Staging all changes..."
    git add .
    
    echo "💾 Committing changes..."
    git commit -m "Prepare for Vercel deployment - WRE LMS Platform"
fi

echo "✅ Project is ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push to GitHub: git push -u origin main"
echo "2. Go to https://vercel.com and import your repository"
echo "3. Add environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
echo "📖 See DEPLOY.md for detailed instructions"



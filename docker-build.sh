#!/bin/bash

# ============================================
# Docker Build & Push Script
# Build Docker image và push lên Docker Hub
# ============================================

set -e  # Exit on error

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============= CONFIG =============
DOCKER_USERNAME=${DOCKER_USERNAME:-""}
IMAGE_NAME="login-app"
REGISTRY="docker.io"

# Get git info
GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

# ============= FUNCTIONS =============

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

check_docker() {
    print_header "Kiểm tra Docker"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker không được cài đặt"
        exit 1
    fi
    
    if ! docker ps &> /dev/null; then
        print_error "Docker daemon không chạy"
        exit 1
    fi
    
    print_success "Docker đang chạy"
    docker --version
}

check_credentials() {
    print_header "Kiểm tra Docker Hub Credentials"
    
    if [ -z "$DOCKER_USERNAME" ]; then
        read -p "Nhập Docker Hub username: " DOCKER_USERNAME
    fi
    
    if [ -z "$DOCKER_USERNAME" ]; then
        print_error "Docker Hub username không được nhập"
        exit 1
    fi
    
    print_info "Sử dụng username: $DOCKER_USERNAME"
    print_info "Đảm bảo bạn đã login: docker login"
}

check_git() {
    print_header "Kiểm tra Git repository"
    
    if [ ! -d ".git" ]; then
        print_error "Không tìm thấy .git folder"
        exit 1
    fi
    
    print_info "Git Branch: $GIT_BRANCH"
    print_info "Git Commit: $GIT_COMMIT"
}

build_image() {
    print_header "Build Docker Image"
    
    TAGS=(
        "$DOCKER_USERNAME/$IMAGE_NAME:latest"
        "$DOCKER_USERNAME/$IMAGE_NAME:$GIT_COMMIT"
        "$DOCKER_USERNAME/$IMAGE_NAME:$GIT_BRANCH"
    )
    
    TAG_ARGS=""
    for tag in "${TAGS[@]}"; do
        TAG_ARGS="$TAG_ARGS -t $tag"
    done
    
    print_info "Build tags: ${TAGS[*]}"
    print_info "Build date: $BUILD_DATE"
    
    docker build \
        $TAG_ARGS \
        --build-arg BUILD_DATE="$BUILD_DATE" \
        --build-arg VCS_REF="$GIT_COMMIT" \
        --build-arg VERSION="$GIT_BRANCH-$GIT_COMMIT" \
        -f Dockerfile \
        .
    
    print_success "Image built thành công"
}

push_image() {
    print_header "Push Image lên Docker Hub"
    
    PUSH_TAGS=(
        "$DOCKER_USERNAME/$IMAGE_NAME:latest"
        "$DOCKER_USERNAME/$IMAGE_NAME:$GIT_COMMIT"
        "$DOCKER_USERNAME/$IMAGE_NAME:$GIT_BRANCH"
    )
    
    for tag in "${PUSH_TAGS[@]}"; do
        print_info "Pushing $tag..."
        docker push "$tag"
    done
    
    print_success "Tất cả images đã được push"
}

show_image_info() {
    print_header "Image Information"
    
    print_info "Image size:"
    docker images | grep "$IMAGE_NAME"
    
    echo ""
    print_info "Có thể pull image bằng lệnh:"
    echo -e "  ${BLUE}docker pull $DOCKER_USERNAME/$IMAGE_NAME:latest${NC}"
    echo -e "  ${BLUE}docker pull $DOCKER_USERNAME/$IMAGE_NAME:$GIT_COMMIT${NC}"
}

# ============= MAIN =============

main() {
    echo -e "\n${BLUE}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  🐳 Docker Build & Push Script"
    echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}\n"
    
    # Kiểm tra prerequisites
    check_docker
    check_credentials
    check_git
    
    # Build & Push
    build_image
    
    read -p "Bạn muốn push image lên Docker Hub không? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Đảm bảo bạn đã chạy: docker login"
        push_image
    else
        print_info "Skip push step"
    fi
    
    # Show info
    show_image_info
    
    echo -e "\n${GREEN}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  ✅ Hoàn thành"
    echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}\n"
}

# ============= ERROR HANDLING =============

trap 'print_error "Build failed at line $LINENO"; exit 1' ERR

# ============= RUN =============

main "$@"

@extends('layouts.app')

@section('title')
    创建名片 - APEXCARD
@endsection

@section('content')
<div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">创建新名片</h1>
            <p class="text-gray-600 mt-2">填写您的信息，创建专业的数字名片</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Form -->
            <div class="lg:col-span-2">
                <form id="cardForm" class="bg-white rounded-lg shadow-md p-6">
                    @csrf
                    <!-- Basic Information -->
                    <div class="mb-8">
                        <h2 class="text-xl font-semibold mb-4">基本信息</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                                <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">职位</label>
                                <input type="text" name="position" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">公司</label>
                                <input type="text" name="company" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                                <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">电话</label>
                                <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">办公电话</label>
                                <input type="tel" name="office_phone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">地址</label>
                            <input type="text" name="address" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
                            <textarea name="bio" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                    </div>

                    <!-- Photos -->
                    <div class="mb-8">
                        <h2 class="text-xl font-semibold mb-4">照片设置</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">个人头像</label>
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <div id="avatarPreview" class="mb-2">
                                        <i data-lucide="user" class="w-12 h-12 text-gray-400 mx-auto"></i>
                                    </div>
                                    <input type="file" id="avatarInput" accept="image/*" class="hidden">
                                    <button type="button" onclick="document.getElementById('avatarInput').click()" class="text-blue-600 hover:text-blue-800 text-sm">上传头像</button>
                                </div>
                                <input type="hidden" name="avatar" id="avatar">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">封面照片</label>
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <div id="coverPreview" class="mb-2">
                                        <i data-lucide="image" class="w-12 h-12 text-gray-400 mx-auto"></i>
                                    </div>
                                    <input type="file" id="coverInput" accept="image/*" class="hidden">
                                    <button type="button" onclick="document.getElementById('coverInput').click()" class="text-blue-600 hover:text-blue-800 text-sm">上传封面</button>
                                </div>
                                <input type="hidden" name="cover_photo" id="cover_photo">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">公司Logo</label>
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <div id="logoPreview" class="mb-2">
                                        <i data-lucide="briefcase" class="w-12 h-12 text-gray-400 mx-auto"></i>
                                    </div>
                                    <input type="file" id="logoInput" accept="image/*" class="hidden">
                                    <button type="button" onclick="document.getElementById('logoInput').click()" class="text-blue-600 hover:text-blue-800 text-sm">上传Logo</button>
                                </div>
                                <input type="hidden" name="logo" id="logo">
                            </div>
                        </div>
                    </div>

                    <!-- Template Selection -->
                    <div class="mb-8">
                        <h2 class="text-xl font-semibold mb-4">选择模板</h2>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <label class="cursor-pointer">
                                <input type="radio" name="template" value="modern-blue" checked class="sr-only">
                                <div class="border-2 border-blue-600 rounded-lg p-4 text-center">
                                    <div class="h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded mb-2"></div>
                                    <span class="text-sm">现代蓝色</span>
                                </div>
                            </label>
                            <label class="cursor-pointer">
                                <input type="radio" name="template" value="classic-black" class="sr-only">
                                <div class="border-2 border-gray-300 rounded-lg p-4 text-center hover:border-gray-400">
                                    <div class="h-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded mb-2"></div>
                                    <span class="text-sm">经典黑色</span>
                                </div>
                            </label>
                            <label class="cursor-pointer">
                                <input type="radio" name="template" value="minimal-white" class="sr-only">
                                <div class="border-2 border-gray-300 rounded-lg p-4 text-center hover:border-gray-400">
                                    <div class="h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded mb-2"></div>
                                    <span class="text-sm">极简白色</span>
                                </div>
                            </label>
                            <label class="cursor-pointer">
                                <input type="radio" name="template" value="creative-gradient" class="sr-only">
                                <div class="border-2 border-gray-300 rounded-lg p-4 text-center hover:border-gray-400">
                                    <div class="h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded mb-2"></div>
                                    <span class="text-sm">创意渐变</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Social Links -->
                    <div class="mb-8">
                        <h2 class="text-xl font-semibold mb-4">社交媒体链接</h2>
                        <div id="socialLinksContainer" class="space-y-3">
                            <div class="social-link-item flex gap-2">
                                <select name="social_links[0][platform]" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">选择平台</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="twitter">Twitter</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="wechat">微信</option>
                                    <option value="line">LINE</option>
                                    <option value="website">个人网站</option>
                                    <option value="other">其他</option>
                                </select>
                                <input type="url" name="social_links[0][url]" placeholder="链接地址" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <input type="text" name="social_links[0][username]" placeholder="用户名" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <button type="button" onclick="removeSocialLink(this)" class="text-red-600 hover:text-red-800">
                                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                                </button>
                            </div>
                        </div>
                        <button type="button" onclick="addSocialLink()" class="mt-3 text-blue-600 hover:text-blue-800 text-sm">
                            <i data-lucide="plus" class="w-4 h-4 inline mr-1"></i>
                            添加社交链接
                        </button>
                    </div>

                    <!-- Settings -->
                    <div class="mb-8">
                        <h2 class="text-xl font-semibold mb-4">设置</h2>
                        <div class="flex items-center">
                            <input type="checkbox" name="is_public" id="is_public" checked class="mr-2">
                            <label for="is_public" class="text-sm font-medium text-gray-700">公开名片</label>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="flex gap-4">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            创建名片
                        </button>
                        <a href="{{ route('dashboard') }}" class="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                            取消
                        </a>
                    </div>
                </form>
            </div>

            <!-- Preview -->
            <div class="lg:col-span-1">
                <div class="bg-white rounded-lg shadow-md p-6 sticky top-4">
                    <h2 class="text-xl font-semibold mb-4">实时预览</h2>
                    <div id="cardPreview" class="border rounded-lg overflow-hidden">
                        <div class="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                        <div class="p-4">
                            <div class="flex items-center mb-4">
                                <div class="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                                <div>
                                    <h3 class="font-bold text-gray-900">您的姓名</h3>
                                    <p class="text-sm text-gray-600">您的职位</p>
                                </div>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex items-center text-gray-600">
                                    <i data-lucide="phone" class="w-4 h-4 mr-2"></i>
                                    <span>电话号码</span>
                                </div>
                                <div class="flex items-center text-gray-600">
                                    <i data-lucide="mail" class="w-4 h-4 mr-2"></i>
                                    <span>邮箱地址</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    let socialLinkIndex = 1;

    function addSocialLink() {
        const container = document.getElementById('socialLinksContainer');
        const newLink = document.createElement('div');
        newLink.className = 'social-link-item flex gap-2';
        newLink.innerHTML = `
            <select name="social_links[${socialLinkIndex}][platform]" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">选择平台</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="wechat">微信</option>
                <option value="line">LINE</option>
                <option value="website">个人网站</option>
                <option value="other">其他</option>
            </select>
            <input type="url" name="social_links[${socialLinkIndex}][url]" placeholder="链接地址" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <input type="text" name="social_links[${socialLinkIndex}][username]" placeholder="用户名" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button type="button" onclick="removeSocialLink(this)" class="text-red-600 hover:text-red-800">
                <i data-lucide="trash-2" class="w-5 h-5"></i>
            </button>
        `;
        container.appendChild(newLink);
        socialLinkIndex++;
        lucide.createIcons();
    }

    function removeSocialLink(button) {
        button.parentElement.remove();
    }

    // Handle file uploads
    document.getElementById('avatarInput').addEventListener('change', function(e) {
        handleFileUpload(e, 'avatar', 'avatarPreview');
    });

    document.getElementById('coverInput').addEventListener('change', function(e) {
        handleFileUpload(e, 'cover_photo', 'coverPreview');
    });

    document.getElementById('logoInput').addEventListener('change', function(e) {
        handleFileUpload(e, 'logo', 'logoPreview');
    });

    function handleFileUpload(event, fieldName, previewId) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.url) {
                    document.getElementById(fieldName).value = data.url;
                    const preview = document.getElementById(previewId);
                    preview.innerHTML = `<img src="${data.url}" class="w-12 h-12 object-cover rounded mx-auto">`;
                }
            })
            .catch(error => {
                console.error('Upload failed:', error);
            });
        }
    }

    // Handle template selection
    document.querySelectorAll('input[name="template"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('input[name="template"]').forEach(r => {
                r.parentElement.querySelector('div').classList.remove('border-blue-600');
                r.parentElement.querySelector('div').classList.add('border-gray-300');
            });
            this.parentElement.querySelector('div').classList.remove('border-gray-300');
            this.parentElement.querySelector('div').classList.add('border-blue-600');
        });
    });

    // Form submission
    document.getElementById('cardForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            if (key.includes('[')) {
                // Handle array fields
                const matches = key.match(/([^\[]+)\[(\d+)\]\[([^\]]+)\]/);
                if (matches) {
                    const [, field, index, subField] = matches;
                    if (!data[field]) data[field] = [];
                    if (!data[field][index]) data[field][index] = {};
                    data[field][index][subField] = value;
                }
            } else {
                data[key] = value;
            }
        }

        // Clean up empty social links
        if (data.social_links) {
            data.social_links = data.social_links.filter(link => link.platform && link.url);
        }

        fetch('/api/cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Authorization': 'Bearer ' + document.querySelector('meta[name="api-token"]').content
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.card) {
                window.location.href = '/dashboard';
            } else {
                alert('创建失败，请检查输入信息');
            }
        })
        .catch(error => {
            console.error('Submission failed:', error);
            alert('创建失败，请稍后重试');
        });
    });

    // Initialize Lucide icons
    document.addEventListener('DOMContentLoaded', function() {
        lucide.createIcons();
    });
</script>
@endpush

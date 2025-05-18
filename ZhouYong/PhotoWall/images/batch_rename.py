#coding: utf-8
import os
import glob

# 获取当前目录
current_dir = os.getcwd()

# 支持的图片扩展名
image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.bmp', '*.tiff', '*.webp']

# 获取所有图片文件
image_files = []
for ext in image_extensions:
    image_files.extend(glob.glob(os.path.join(current_dir, ext)))

# 按文件名排序
image_files.sort()

# 重命名并打印结果
for i, old_path in enumerate(image_files, start=1):
    # 获取文件扩展名
    _, ext = os.path.splitext(old_path)
    
    # 构建新文件名
    new_filename = f"photo_{i}{ext}"
    new_path = os.path.join(current_dir, new_filename)
    
    # 重命名文件
    os.rename(old_path, new_path)
    
    # 打印父目录/新文件名
    print(f"{os.path.basename(current_dir)}/{new_filename}")

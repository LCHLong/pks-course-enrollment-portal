import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [Seed] Bắt đầu khởi tạo dữ liệu mẫu cho PKS Portal...');

  // 1. Tạo tài khoản Quản trị viên (Admin) - Mật khẩu băm bằng bcrypt với salt >= 10
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pks.edu.vn' },
    update: {},
    create: {
      name: 'PKS Quản Trị Viên',
      email: 'admin@pks.edu.vn',
      password_hash: adminPasswordHash,
      role: 'admin',
    },
  });
  console.log(`👤 [Admin created] ${admin.email} (Mật khẩu: Admin@123456)`);

  // 2. Tạo tài khoản Học viên mẫu (Student)
  const studentPasswordHash = await bcrypt.hash('Student@123456', 10);
  const student1 = await prisma.user.upsert({
    where: { email: 'student@pks.edu.vn' },
    update: {},
    create: {
      name: 'Nguyễn Văn Học Viên',
      email: 'student@pks.edu.vn',
      password_hash: studentPasswordHash,
      role: 'student',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'tran.thi.b@pks.edu.vn' },
    update: {},
    create: {
      name: 'Trần Thị B',
      email: 'tran.thi.b@pks.edu.vn',
      password_hash: studentPasswordHash,
      role: 'student',
    },
  });
  console.log(`🎓 [Students created] ${student1.email}, ${student2.email} (Mật khẩu: Student@123456)`);

  // 3. Khởi tạo danh sách các khóa học công nghệ thực chiến tại PKS
  const coursesData = [
    {
      title: 'Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)',
      category: 'Fullstack Development',
      instructor: 'ThS. Hoàng Phúc (PKS Education)',
      description: 'Đào tạo thực chiến dự án web theo mô hình Co-op, làm chủ kiến trúc phân tầng RESTful API, PostgreSQL, React Vite và tối ưu hiệu năng tải lớn.',
      price: 1850000,
      capacity: 20,
      enrolled_count: 14,
      is_active: true,
    },
    {
      title: 'Luyện Thi Chứng Chỉ Quốc Tế MOS Excel Expert',
      category: 'Tin Học Văn Phòng',
      instructor: 'PKS Master Trainer',
      description: 'Trang bị toàn diện kỹ năng xử lý dữ liệu nâng cao, trực quan hóa biểu đồ và tối ưu bảng tính phục vụ môi trường doanh nghiệp.',
      price: 950000,
      capacity: 25,
      enrolled_count: 25, // Khóa học này ĐÃ HẾT CHỖ (25/25) để test tính năng vô hiệu hóa nút đăng ký
      is_active: true,
    },
    {
      title: 'Xây Dựng RESTful API Chuyên Sâu với Express & PostgreSQL',
      category: 'Backend Development',
      instructor: 'Kỹ Sư Nguyễn Minh',
      description: 'Nắm vững kỹ thuật xử lý Concurrency, Row Locking SELECT FOR UPDATE và tối ưu Database Indexing trong môi trường production.',
      price: 1450000,
      capacity: 30,
      enrolled_count: 29, // SẮP HẾT CHỖ (29/30) - Thích hợp để test Race Condition tranh suất cuối!
      is_active: true,
    },
    {
      title: 'React.js & Tailwind CSS Hiện Đại từ Cơ Bản đến Nâng Cao',
      category: 'Frontend Development',
      instructor: 'Lê Hoàng Nam (Frontend Lead)',
      description: 'Thực hành xây dựng Single Page Application chuẩn UI/UX, tối ưu hóa re-render, Custom Hooks và Dark Mode.',
      price: 1200000,
      capacity: 25,
      enrolled_count: 8,
      is_active: true,
    },
    {
      title: 'Luyện Thi MOS Word & PowerPoint Toàn Diện',
      category: 'Tin Học Văn Phòng',
      instructor: 'Vũ Thu Trang (MOS Specialist)',
      description: 'Lộ trình cấp tốc ôn luyện đề thi MOS quốc tế, làm chủ định dạng văn bản chuyên nghiệp và kỹ năng thuyết trình ấn tượng.',
      price: 850000,
      capacity: 20,
      enrolled_count: 5,
      is_active: true,
    },
    {
      title: 'Kiến Trúc Microservices & Docker cho Lập Trình Viên Node.js',
      category: 'DevOps & Architecture',
      instructor: 'Phạm Đức Duy (Solution Architect)',
      description: 'Container hóa ứng dụng với Docker, thiết kế Message Broker và triển khai hệ thống phân tán chịu tải cao.',
      price: 2100000,
      capacity: 15,
      enrolled_count: 3,
      is_active: true,
    },
  ];

  for (const courseItem of coursesData) {
    const existing = await prisma.course.findFirst({
      where: { title: courseItem.title },
    });

    if (!existing) {
      await prisma.course.create({
        data: courseItem,
      });
    }
  }

  console.log(`📚 [Courses seeded] Đã khởi tạo thành công ${coursesData.length} khóa học đa dạng trạng thái.`);

  // 4. Khởi tạo một số lượt ghi danh mẫu (Enrollments)
  const fullstackCourse = await prisma.course.findFirst({
    where: { title: { contains: 'Fullstack' } },
  });

  if (fullstackCourse) {
    await prisma.enrollment.upsert({
      where: {
        user_id_course_id: {
          user_id: student1.id,
          course_id: fullstackCourse.id,
        },
      },
      update: {},
      create: {
        user_id: student1.id,
        course_id: fullstackCourse.id,
        status: 'enrolled',
      },
    });
    console.log(`📝 [Enrollment seeded] Đã ghi danh học viên ${student1.email} vào khóa học ${fullstackCourse.title}`);
  }

  console.log('✅ [Seed completed] Khởi tạo dữ liệu mẫu thành công 100%!');
}

main()
  .catch((e) => {
    console.error('❌ [Seed error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

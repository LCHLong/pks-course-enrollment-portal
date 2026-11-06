import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [Seed] Bắt đầu khởi tạo dữ liệu mẫu cho PKS Portal...');

  // 1. Tạo tài khoản Quản trị viên (Admin) - Mật khẩu băm bằng bcrypt với salt >= 10
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pks.edu.vn' },
    update: {
      name: 'PKS Quản Trị Viên',
      password_hash: adminPasswordHash,
      role: 'admin',
    },
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
    update: {
      name: 'Nguyễn Văn Học Viên',
      password_hash: studentPasswordHash,
      role: 'student',
    },
    create: {
      name: 'Nguyễn Văn Học Viên',
      email: 'student@pks.edu.vn',
      password_hash: studentPasswordHash,
      role: 'student',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'tran.thi.b@pks.edu.vn' },
    update: {
      name: 'Trần Thị B',
      password_hash: studentPasswordHash,
      role: 'student',
    },
    create: {
      name: 'Trần Thị B',
      email: 'tran.thi.b@pks.edu.vn',
      password_hash: studentPasswordHash,
      role: 'student',
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {
      name: 'Học Viên Mẫu 1',
      password_hash: studentPasswordHash,
      role: 'student',
    },
    create: {
      name: 'Học Viên Mẫu 1',
      email: 'student1@example.com',
      password_hash: studentPasswordHash,
      role: 'student',
    },
  });
  console.log(`🎓 [Students created] ${student1.email}, ${student2.email}, ${student3.email} (Mật khẩu: Student@123456)`);

  // 3. Khởi tạo danh sách các khóa học công nghệ thực chiến tại PKS (6 khóa học chuẩn)
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

  // Dọn dẹp các khóa học tạm phát sinh ngoài 6 khóa học chuẩn (để database luôn sạch sẽ)
  const canonicalTitles = coursesData.map((c) => c.title);
  const testCourses = await prisma.course.findMany({
    where: { title: { notIn: canonicalTitles } },
    select: { id: true, title: true },
  });

  for (const tc of testCourses) {
    await prisma.enrollment.deleteMany({ where: { course_id: tc.id } });
    await prisma.course.delete({ where: { id: tc.id } });
    console.log(`🧹 [Cleaned test course] ${tc.title}`);
  }

  for (const courseItem of coursesData) {
    const existing = await prisma.course.findFirst({
      where: { title: courseItem.title },
    });

    if (existing) {
      await prisma.course.update({
        where: { id: existing.id },
        data: courseItem,
      });
    } else {
      await prisma.course.create({
        data: courseItem,
      });
    }
  }

  console.log(`📚 [Courses seeded] Đã khởi tạo thành công ${coursesData.length} khóa học chuẩn đa dạng trạng thái.`);

  // 4. Khởi tạo một số lượt ghi danh mẫu (Enrollments)
  const fullstackCourse = await prisma.course.findFirst({
    where: { title: 'Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)' },
  });

  if (fullstackCourse) {
    // Dọn dẹp ghi danh của student1 vào fullstackCourse nếu có từ lần chạy test trước
    // để kịch bản Postman test ghi danh lần đầu cho student1 luôn thành công (201 Created)
    await prisma.enrollment.deleteMany({
      where: {
        user_id: student1.id,
        course_id: fullstackCourse.id,
      },
    });

    // Ghi danh student2 vào fullstackCourse để đảm bảo admin query danh sách ghi danh luôn có dữ liệu
    await prisma.enrollment.upsert({
      where: {
        user_id_course_id: {
          user_id: student2.id,
          course_id: fullstackCourse.id,
        },
      },
      update: {
        status: 'enrolled',
      },
      create: {
        user_id: student2.id,
        course_id: fullstackCourse.id,
        status: 'enrolled',
      },
    });
    console.log(`📝 [Enrollment seeded] Đã ghi danh học viên ${student2.email} vào khóa học ${fullstackCourse.title}`);
  }

  // Ghi danh student1 vào khóa học React để My Courses có dữ liệu ban đầu
  const reactCourse = await prisma.course.findFirst({
    where: { title: 'React.js & Tailwind CSS Hiện Đại từ Cơ Bản đến Nâng Cao' },
  });

  if (reactCourse) {
    await prisma.enrollment.upsert({
      where: {
        user_id_course_id: {
          user_id: student1.id,
          course_id: reactCourse.id,
        },
      },
      update: {
        status: 'enrolled',
      },
      create: {
        user_id: student1.id,
        course_id: reactCourse.id,
        status: 'enrolled',
      },
    });
    console.log(`📝 [Enrollment seeded] Đã ghi danh học viên ${student1.email} vào khóa học ${reactCourse.title}`);
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

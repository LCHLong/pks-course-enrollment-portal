import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [Seed] Bắt đầu khởi tạo dữ liệu mẫu thực tế và nhất quán cho PKS Portal...');

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

  // 2. Danh sách các tài khoản Học viên mẫu (Students) với tên tiếng Việt tự nhiên và phong phú
  const defaultPasswordHash = await bcrypt.hash('Student@123456', 10);

  const studentsData = [
    { name: 'Nguyễn Văn Học Viên', email: 'student@pks.edu.vn' },
    { name: 'Trần Thị B', email: 'tran.thi.b@pks.edu.vn' },
    { name: 'Lê Hoàng Long', email: 'le.hoang.long@pks.edu.vn' },
    { name: 'Phạm Minh Đức', email: 'pham.minh.duc@pks.edu.vn' },
    { name: 'Hoàng Thị Mai', email: 'hoang.thi.mai@pks.edu.vn' },
    { name: 'Vũ Quỳnh Anh', email: 'vu.quynh.anh@pks.edu.vn' },
    { name: 'Đỗ Việt Thắng', email: 'do.viet.thang@pks.edu.vn' },
    { name: 'Bùi Thanh Tùng', email: 'bui.thanh.tung@pks.edu.vn' },
    { name: 'Đinh Xuân Bách', email: 'dinh.xuan.bach@pks.edu.vn' },
    { name: 'Nguyễn Thu Hà', email: 'nguyen.thu.ha@pks.edu.vn' },
    { name: 'Đặng Quốc Huy', email: 'dang.quoc.huy@pks.edu.vn' },
    { name: 'Phan Ngọc Ánh', email: 'phan.ngoc.anh@pks.edu.vn' },
    { name: 'Trịnh Văn Nam', email: 'trinh.van.nam@pks.edu.vn' },
    { name: 'Cao Thị Yến', email: 'cao.thi.yen@pks.edu.vn' },
    { name: 'Ngô Tấn Tài', email: 'ngo.tan.tai@pks.edu.vn' },
    { name: 'Dương Mỹ Linh', email: 'duong.my.linh@pks.edu.vn' },
    { name: 'Học Viên Mẫu 1', email: 'student1@example.com' },
  ];

  const studentUsers: Record<string, any> = {};

  for (const s of studentsData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        password_hash: defaultPasswordHash,
        role: 'student',
      },
      create: {
        name: s.name,
        email: s.email,
        password_hash: defaultPasswordHash,
        role: 'student',
      },
    });
    studentUsers[s.email] = user;
  }
  console.log(`🎓 [Students seeded] Đã khởi tạo thành công ${studentsData.length} tài khoản học viên.`);

  // 3. Khởi tạo danh sách các khóa học công nghệ tại PKS với sĩ số hợp lý
  const coursesData = [
    {
      title: 'Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)',
      category: 'Fullstack Development',
      instructor: 'ThS. Hoàng Phúc (PKS Education)',
      description: 'Đào tạo thực chiến dự án web theo mô hình Co-op, làm chủ kiến trúc phân tầng RESTful API, PostgreSQL, React Vite và tối ưu hiệu năng tải lớn.',
      price: 1850000,
      capacity: 20,
      is_active: true,
    },
    {
      title: 'Luyện Thi Chứng Chỉ Quốc Tế MOS Excel Expert',
      category: 'Tin Học Văn Phòng',
      instructor: 'PKS Master Trainer',
      description: 'Trang bị toàn diện kỹ năng xử lý dữ liệu nâng cao, trực quan hóa biểu đồ và tối ưu bảng tính phục vụ môi trường doanh nghiệp.',
      price: 950000,
      capacity: 8, // Khóa học này ĐÃ HẾT CHỖ (8/8) - Toàn bộ 8 học viên đều có bản ghi trong CSDL
      is_active: true,
    },
    {
      title: 'Xây Dựng RESTful API Chuyên Sâu với Express & PostgreSQL',
      category: 'Backend Development',
      instructor: 'Kỹ Sư Nguyễn Minh',
      description: 'Nắm vững kỹ thuật xử lý Concurrency, Row Locking SELECT FOR UPDATE và tối ưu Database Indexing trong môi trường production.',
      price: 1450000,
      capacity: 6, // SẮP HẾT CHỖ (5/6) - Đã có 5 học viên thực tế, còn đúng 1 suất cuối để test Concurrency
      is_active: true,
    },
    {
      title: 'React.js & Tailwind CSS Hiện Đại từ Cơ Bản đến Nâng Cao',
      category: 'Frontend Development',
      instructor: 'Lê Hoàng Nam (Frontend Lead)',
      description: 'Thực hành xây dựng Single Page Application chuẩn UI/UX, tối ưu hóa re-render, Custom Hooks và Dark Mode.',
      price: 1200000,
      capacity: 15,
      is_active: true,
    },
    {
      title: 'Luyện Thi MOS Word & PowerPoint Toàn Diện',
      category: 'Tin Học Văn Phòng',
      instructor: 'Vũ Thu Trang (MOS Specialist)',
      description: 'Lộ trình cấp tốc ôn luyện đề thi MOS quốc tế, làm chủ định dạng văn bản chuyên nghiệp và kỹ năng thuyết trình ấn tượng.',
      price: 850000,
      capacity: 12,
      is_active: true,
    },
    {
      title: 'Kiến Trúc Microservices & Docker cho Lập Trình Viên Node.js',
      category: 'DevOps & Architecture',
      instructor: 'Phạm Đức Duy (Solution Architect)',
      description: 'Container hóa ứng dụng với Docker, thiết kế Message Broker và triển khai hệ thống phân tán chịu tải cao.',
      price: 2100000,
      capacity: 10,
      is_active: true,
    },
  ];

  // Dọn dẹp các khóa học tạm phát sinh ngoài danh mục chuẩn
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

  const courseEntities: Record<string, any> = {};

  for (const courseItem of coursesData) {
    const existing = await prisma.course.findFirst({
      where: { title: courseItem.title },
    });

    if (existing) {
      const updated = await prisma.course.update({
        where: { id: existing.id },
        data: {
          ...courseItem,
          // Tạm thời để nguyên, sau đó đồng bộ chính xác với số bản ghi thực tế
        },
      });
      courseEntities[courseItem.title] = updated;
    } else {
      const created = await prisma.course.create({
        data: {
          ...courseItem,
          enrolled_count: 0,
        },
      });
      courseEntities[courseItem.title] = created;
    }
  }

  console.log(`📚 [Courses seeded] Đã khởi tạo thành công ${coursesData.length} khóa học chuẩn.`);

  // 4. Khởi tạo danh sách Enrollment THỰC TẾ 100% Khớp với Số Lượng Hiển Thị
  // Đảm bảo không bao giờ có tình trạng "ghi nhận 4-5 người nhưng chỉ có 1 người hiện dữ liệu"

  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // Kịch bản phân bổ học viên vào từng khóa học:
  const enrollmentPlan = [
    // Khóa 1: Lập Trình Web Fullstack (5 học viên active + 1 đã hủy)
    // Lưu ý: KHÔNG cho student@pks.edu.vn vào đây để người dùng/Postman test bấm "Ghi danh" thành công
    {
      courseTitle: 'Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)',
      students: [
        { email: 'tran.thi.b@pks.edu.vn', status: 'confirmed' as const, date: daysAgo(10) },
        { email: 'le.hoang.long@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(8) },
        { email: 'pham.minh.duc@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(6) },
        { email: 'hoang.thi.mai@pks.edu.vn', status: 'confirmed' as const, date: daysAgo(4) },
        { email: 'vu.quynh.anh@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(2) },
        { email: 'ngo.tan.tai@pks.edu.vn', status: 'cancelled' as const, date: daysAgo(7) }, // Hồ sơ đã hủy
      ],
    },

    // Khóa 2: MOS Excel Expert (8/8 - Hết chỗ, đủ 8 học viên thực tế)
    {
      courseTitle: 'Luyện Thi Chứng Chỉ Quốc Tế MOS Excel Expert',
      students: [
        { email: 'do.viet.thang@pks.edu.vn', status: 'confirmed' as const, date: daysAgo(12) },
        { email: 'bui.thanh.tung@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(11) },
        { email: 'dinh.xuan.bach@pks.edu.vn', status: 'confirmed' as const, date: daysAgo(9) },
        { email: 'nguyen.thu.ha@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(8) },
        { email: 'dang.quoc.huy@pks.edu.vn', status: 'confirmed' as const, date: daysAgo(7) },
        { email: 'phan.ngoc.anh@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(5) },
        { email: 'trinh.van.nam@pks.edu.vn', status: 'confirmed' as const, date: daysAgo(4) },
        { email: 'cao.thi.yen@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(2) },
      ],
    },

    // Khóa 3: RESTful API (5/6 - Suất cuối cùng, đủ 5 học viên thực tế)
    {
      courseTitle: 'Xây Dựng RESTful API Chuyên Sâu với Express & PostgreSQL',
      students: [
        { email: 'duong.my.linh@pks.edu.vn', status: 'confirmed' as const, date: daysAgo(14) },
        { email: 'le.hoang.long@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(10) },
        { email: 'pham.minh.duc@pks.edu.vn', status: 'confirmed' as const, date: daysAgo(7) },
        { email: 'hoang.thi.mai@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(5) },
        { email: 'vu.quynh.anh@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(3) },
      ],
    },

    // Khóa 4: React.js & Tailwind (4 học viên - trong đó CÓ student@pks.edu.vn để test trang "Khóa học của tôi")
    {
      courseTitle: 'React.js & Tailwind CSS Hiện Đại từ Cơ Bản đến Nâng Cao',
      students: [
        { email: 'student@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(9) },
        { email: 'do.viet.thang@pks.edu.vn', status: 'confirmed' as const, date: daysAgo(8) },
        { email: 'bui.thanh.tung@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(5) },
        { email: 'dinh.xuan.bach@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(2) },
      ],
    },

    // Khóa 5: MOS Word & PowerPoint (3 học viên)
    {
      courseTitle: 'Luyện Thi MOS Word & PowerPoint Toàn Diện',
      students: [
        { email: 'nguyen.thu.ha@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(6) },
        { email: 'dang.quoc.huy@pks.edu.vn', status: 'confirmed' as const, date: daysAgo(4) },
        { email: 'phan.ngoc.anh@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(1) },
      ],
    },

    // Khóa 6: Microservices & Docker (2 học viên)
    {
      courseTitle: 'Kiến Trúc Microservices & Docker cho Lập Trình Viên Node.js',
      students: [
        { email: 'trinh.van.nam@pks.edu.vn', status: 'confirmed' as const, date: daysAgo(5) },
        { email: 'cao.thi.yen@pks.edu.vn', status: 'enrolled' as const, date: daysAgo(2) },
      ],
    },
  ];

  // Xóa ghi danh cũ của các khóa học này để seed sạch sẽ, không bị dư thừa
  for (const plan of enrollmentPlan) {
    const course = courseEntities[plan.courseTitle];
    if (!course) continue;

    // Lấy danh sách studentIds trong plan
    const planStudentIds = plan.students
      .map((s) => studentUsers[s.email]?.id)
      .filter(Boolean);

    // Xóa các ghi danh của student1 nếu có trong khóa Fullstack (để Postman test luôn pass)
    if (plan.courseTitle.includes('Fullstack')) {
      const student1 = studentUsers['student@pks.edu.vn'];
      if (student1) {
        await prisma.enrollment.deleteMany({
          where: { user_id: student1.id, course_id: course.id },
        });
      }
    }

    // Upsert từng học viên vào bảng enrollment
    for (const item of plan.students) {
      const user = studentUsers[item.email];
      if (!user) continue;

      await prisma.enrollment.upsert({
        where: {
          user_id_course_id: {
            user_id: user.id,
            course_id: course.id,
          },
        },
        update: {
          status: item.status,
          created_at: item.date,
          updated_at: item.date,
        },
        create: {
          user_id: user.id,
          course_id: course.id,
          status: item.status,
          created_at: item.date,
          updated_at: item.date,
        },
      });
    }

    // 5. ĐỒNG BỘ CHÍNH XÁC 100%: Cập nhật enrolled_count trên bảng courses = số bản ghi active trong bảng enrollments
    const activeCount = await prisma.enrollment.count({
      where: {
        course_id: course.id,
        status: { in: ['enrolled', 'confirmed'] },
      },
    });

    await prisma.course.update({
      where: { id: course.id },
      data: {
        enrolled_count: activeCount,
      },
    });

    console.log(
      `📊 [Course synced] ${course.title} -> Sĩ số: ${course.capacity} | Đã ghi danh: ${activeCount} học viên thực tế.`
    );
  }

  console.log('✅ [Seed completed] Khởi tạo dữ liệu mẫu hoàn tất: 100% số lượng hiển thị khớp với số bản ghi thực tế!');
}

main()
  .catch((e) => {
    console.error('❌ [Seed error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

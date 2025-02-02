import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig'
import { getDataFromToken } from '@/helpers/getDataFromToken';
import { uploadImage } from '@/lib/cloudinary';
import Testimonials from '@/models/testimonialsModel';

connect();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const skip = (page - 1) * limit;

    const [testimonials, total] = await Promise.all([
      Testimonials.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
        Testimonials.countDocuments(query)
    ]);

    return NextResponse.json({
      testimonials,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { role } = await getDataFromToken(req)
    if (role !== 'admin') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    
  
    const userImage = formData.get('image');

    if (!userImage || !(userImage instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'Slider is required and must be a file' },
        { status: 400 }
      );
    }

    const imageResponse = await uploadImage(userImage, 'testimonial', 280, 280);

    const returnData = new Testimonials({
      name: formData.get('name')?.toString() || '',
      image: imageResponse || '',
      feedback: formData.get('feedback')?.toString() || '',
      isActive: formData.get('isActive')?.toString() === 'true',
    });
    await returnData.save();
    return NextResponse.json({
      success: true,
      message: 'Testimonials created successfully',
      data: returnData
    }, {
      status: 201
    });
  } catch (error: unknown) {
    return NextResponse.json({
      error: (error as Error).message
    },
      { status: 500 });
  }
}





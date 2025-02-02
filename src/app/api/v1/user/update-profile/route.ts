import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig'
import { getDataFromToken } from '@/helpers/getDataFromToken';
import User from '@/models/userModel';

connect();

export async function POST(req: NextRequest) {
  try {
    const { id } = await getDataFromToken(req)
    if (!id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });


    const { number, email, userId } = await req.json();

    const user = await User.findById(userId);
    console.log(userId)

    if (!user) { return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 }); }
    user.number = number;
    user.email = email;

    await user.save();
    return NextResponse.json({ success: true, message: 'User updated successfully', user }, {
      status: 200
    });

  } catch (error: unknown) {
    return NextResponse.json({
      error: (error as Error).message
    },
      { status: 500 });
  }
}

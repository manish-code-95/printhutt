import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig'
import Slider from '@/models/sliderModel';

connect();

export async function GET() {
    try {
        const sliders = await Slider.find({ isActive: true })
            .sort({ level: 1 })
            .limit(4)
            .lean();


        return NextResponse.json(
            { sliders: sliders, message: "data fetch successfully" },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Error fetching trending products:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}



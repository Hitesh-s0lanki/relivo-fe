import { NextResponse } from "next/server";

type RouteHandlerSuccessResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

type RouteHandlerErrorResponse = {
  success: boolean;
  message: string;
};

export const routeHandlerSuccess = <T>(
  message: string,
  status: number,
  data?: T
): NextResponse<RouteHandlerSuccessResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      message,
      data: (data as T) ?? null,
    },
    { status }
  );
};

export const routeHandlerError = (
  message: string,
  status: number
): NextResponse<RouteHandlerErrorResponse> => {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
};

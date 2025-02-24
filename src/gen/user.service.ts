// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               v5.28.3
// source: user.service.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const protobufPackage = 'userProtoService';

export interface GetUserByUserNameRequest {
  username: string;
  password: string;
}

export interface IsTakenEmailRequest {
  email: string;
}

export interface IsTakenEmailResponse {
  isTaken: boolean;
}

export interface IsTakenPhoneNumberRequest {
  phoneNumber: string;
}

export interface IsTakenPhoneNumberResponse {
  isTaken: boolean;
}

export interface GetUserRequest {
  id: string;
}

export interface GetUserResponse {
  id: string;
  displayName: string;
  photoUrl: string;
  phoneNumber: string;
  country: string;
  address: string;
  state: string;
  city: string;
  zipCode: string;
  about: string;
  role: string;
  isPublic: boolean;
  email: string;
  gender: string;
}

export interface UpdateUserRequest {
  displayName: string;
  photoUrl: string;
  phoneNumber: string;
  country: string;
  address: string;
  state: string;
  city: string;
  zipCode: string;
  about: string;
  role: string;
  email: string;
  gender: string;
  id: string;
}

export interface ManageUserResponse {
  id: string;
  message: string;
  code: string;
  errMessage: string;
}

export interface CreateUserRequest {
  displayName: string;
  phoneNumber: string;
  email: string;
  gender: string;
  password: string;
}

export const USER_PROTO_SERVICE_PACKAGE_NAME = 'userProtoService';

export interface UserServiceClient {
  getUser(request: GetUserRequest): Observable<GetUserResponse>;

  updateUser(request: UpdateUserRequest): Observable<ManageUserResponse>;

  createUser(request: CreateUserRequest): Observable<ManageUserResponse>;

  isTakenEmail(request: IsTakenEmailRequest): Observable<IsTakenEmailResponse>;

  isTakenPhoneNumber(
    request: IsTakenPhoneNumberRequest,
  ): Observable<IsTakenPhoneNumberResponse>;

  getUserByUserName(
    request: GetUserByUserNameRequest,
  ): Observable<ManageUserResponse>;
}

export interface UserServiceController {
  getUser(
    request: GetUserRequest,
  ): Promise<GetUserResponse> | Observable<GetUserResponse> | GetUserResponse;

  updateUser(
    request: UpdateUserRequest,
  ):
    | Promise<ManageUserResponse>
    | Observable<ManageUserResponse>
    | ManageUserResponse;

  createUser(
    request: CreateUserRequest,
  ):
    | Promise<ManageUserResponse>
    | Observable<ManageUserResponse>
    | ManageUserResponse;

  isTakenEmail(
    request: IsTakenEmailRequest,
  ):
    | Promise<IsTakenEmailResponse>
    | Observable<IsTakenEmailResponse>
    | IsTakenEmailResponse;

  isTakenPhoneNumber(
    request: IsTakenPhoneNumberRequest,
  ):
    | Promise<IsTakenPhoneNumberResponse>
    | Observable<IsTakenPhoneNumberResponse>
    | IsTakenPhoneNumberResponse;

  getUserByUserName(
    request: GetUserByUserNameRequest,
  ):
    | Promise<ManageUserResponse>
    | Observable<ManageUserResponse>
    | ManageUserResponse;
}

export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'getUser',
      'updateUser',
      'createUser',
      'isTakenEmail',
      'isTakenPhoneNumber',
      'getUserByUserName',
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod('UserService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcStreamMethod('UserService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const USER_SERVICE_NAME = 'UserService';

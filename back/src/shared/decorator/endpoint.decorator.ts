import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Delete,
  Get,
  Head,
  HttpCode,
  Options,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ExceptionResponse } from '../exceptions/exception-response';
import { Type as ClassConstructor } from '@nestjs/common/interfaces';

export interface ResponseDefinition {
  status: number;
  description: string;
  type: ClassConstructor | typeof Object;
  isArray?: boolean;
}

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PATCH'
  | 'PUT'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

type NestMethodDecorator = (path?: string | string[]) => MethodDecorator;

const METHOD_MAP: Record<HttpMethod, NestMethodDecorator> = {
  GET: Get,
  POST: Post,
  PATCH: Patch,
  PUT: Put,
  DELETE: Delete,
  OPTIONS: Options,
  HEAD: Head,
};

export interface EndpointParams {
  method: HttpMethod;
  summary: string;
  route: string;
  responses: ResponseDefinition[];
}

interface MethodMetadata {
  target: object;
  key: string | symbol;
  descriptor: PropertyDescriptor;
}

const getMethodDecorator = (method: HttpMethod): NestMethodDecorator => {
  const decorator = METHOD_MAP[method];
  if (!decorator) {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }
  return decorator;
};

const getSuccessfulResponse = (
  responses: ResponseDefinition[],
): ResponseDefinition | undefined => {
  const successResponses = responses.filter(
    (response) => response.status >= 200 && response.status < 300,
  );

  if (successResponses.length !== 1) {
    throw new Error(
      '[EndpointDecorator] Each endpoint requires one successful response (status 2XX).',
    );
  }

  return successResponses[0];
};

const applyMethodDecorator = (
  methodDecorator: NestMethodDecorator,
  route: string,
  metadata: MethodMetadata,
): void => {
  methodDecorator(route)(metadata.target, metadata.key, metadata.descriptor);
};

const applyApiOperation = (summary: string, metadata: MethodMetadata): void => {
  ApiOperation({ summary })(metadata.target, metadata.key, metadata.descriptor);
};

const applyApiResponses = (
  responses: ResponseDefinition[],
  metadata: MethodMetadata,
): void => {
  responses.forEach((response) =>
    ApiResponse({
      status: response.status,
      description: response.description,
      type: response.type,
      isArray: response.isArray,
    })(metadata.target, metadata.key, metadata.descriptor),
  );
};

const applyGlobalApiResponses = (metadata: MethodMetadata): void => {
  ApiResponse({
    status: '4XX',
    description: 'Client-side exception',
    type: ExceptionResponse,
  })(metadata.target, metadata.key, metadata.descriptor);

  ApiResponse({
    status: '5XX',
    description: 'Server-side exception',
    type: ExceptionResponse,
  })(metadata.target, metadata.key, metadata.descriptor);
};

const applyHttpCode = (status: number, metadata: MethodMetadata): void => {
  HttpCode(status)(metadata.target, metadata.key, metadata.descriptor);
};

export const Endpoint = (params: EndpointParams): MethodDecorator => {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const metadata: MethodMetadata = { target, key, descriptor };
    const methodDecorator = getMethodDecorator(params.method);

    const successResponse = getSuccessfulResponse(params.responses);
    if (successResponse) {
      applyHttpCode(successResponse.status, metadata);
    }

    applyMethodDecorator(methodDecorator, params.route, metadata);
    applyApiOperation(params.summary, metadata);
    applyApiResponses(params.responses, metadata);
    applyGlobalApiResponses(metadata);

    return descriptor;
  };
};

import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty({
    example:
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTQwMzIwLWFmYzMtNzU5Zi05ZDllLTdmYTMzYzg5MzZkNiIsImlhdCI6MTczNTIxOTI2MSwiZXhwIjoxNzM1NDc4NDYxfQ.VZ9oP5IMOjZ5twnbDp22lWQrgH5PjBpqJrtMkZ3jAk7Isv4D66BEtNr3tqB_MURkbY7NWYlAuoFNAOZ_1uuXBfdgtvgs0MmT4n9nu9dhsNU-dI45zvugVW0P4mT6HyxyT8_89dVr5daT8opkXj_8_n2svA-zjjHl_MbAZ1hcF505y08mP8UtrRqXMzbLG5j1XUiUNl4Qvo9LGUVq1HSdxyQxt2oYoKaITJOLIXMZn752DCUpeUCV9cz2hj9Tdx5NFnX5iL3nkXwq6LEzOUmmaQROLrUSuqgeh52YBgCUkEKRsrHuBgXFa5x0XpUd7DUOW-G3gWgBvZhNVQIlLwJWKw',
  })
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTQwMzIwLWFmYzMtNzU5Zi05ZDllLTdmYTMzYzg5MzZkNiIsImlhdCI6MTczNTIxOTI2MSwiZXhwIjoxNzUwNzcxMjYxfQ.DB9HMq7wqJs4sc76hfOWtwfLozY8fV5q1m1B-JkrJXBrPzDNvKzuWVWCLOBYCg3CtlGYc8o_b8rgk_fpge2dXg2I3uZbpAmRywt5BIBZh8JJJNv6Iew4WOyPizs2SxnyVq4uXOJLOgf8-_1qzrUgmJE7JRsBL-DvCFGKPGCynsvaNUztguJX7mCj3onzEuSqoUzk5apiuRiI0WYASP28SX59srRGJsvMa2E4nlvFnVp7NB0jjVMfdX5ImhSpSdhQ468aQNTt7DSuOH8PkWlK0FaWXgirI646UyjTdU-qEg6mzLHvik_wH31NoEKXkJx8QLcTYItnUCzAtMGEFChvVQ',
  })
  refreshToken: string;

  @ApiProperty({ example: '2025-06-24T13:21:01.404Z' })
  accessExpiresAt: Date;

  @ApiProperty({ example: '2024-12-29T13:21:01.404Z' })
  refreshExpiresAt: Date;
}

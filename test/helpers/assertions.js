import { expect } from 'chai';

export const expectSuccessResponse = (response, statusCode) => {
  expect(response.status).to.equal(statusCode);
  expect(response.body).to.be.an('object');
  expect(response.body).to.have.property('status', 'success');
  expect(response.body).to.have.property('data').that.is.an('object');
};

export const expectErrorResponse = (response, statusCode, errorCode) => {
  expect(response.status).to.equal(statusCode);
  expect(response.body).to.be.an('object');
  expect(response.body).to.have.all.keys('status', 'error', 'message');
  expect(response.body.status).to.equal('error');
  expect(response.body.error).to.equal(errorCode);
  expect(response.body.message).to.be.a('string').and.not.be.empty;
};

export const expectMongoId = (value) => {
  expect(value).to.be.a('string').and.match(/^[a-fA-F0-9]{24}$/);
};

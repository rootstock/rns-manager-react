import React from 'react';
import {
  Container, Row, Col, Card,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { multilanguage } from 'redux-multilanguage';
import { GetDomainStateContainer } from '../../../containers';
import { ResolveAddressContainer } from '../containers';

export default multilanguage((props) => {
  const { strings } = props;

  return (
    <Row center={1}>
      <Col lg={{ span: 10, offset: 1 }} md={12}>
        <Container>
          <Row>
            <Col>
              <h1 className="text-center main-title-box"><b>{strings.home_title}</b></h1>
            </Col>
          </Row>
          <Row>
            <Col><h2 className="text-center">{strings.home_subtitle}</h2></Col>
          </Row>
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>{strings.register_your_domain}</Card.Title>
                  <GetDomainStateContainer />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col style={{ padding: 10 }} md={6} xs={12}>
              <Card>
                <Card.Body>
                  <Card.Title>{strings.resolve_a_domain}</Card.Title>
                  <ResolveAddressContainer />
                </Card.Body>
              </Card>
            </Col>
            <Col style={{ padding: 10 }} md={6} xs={12}>
              <Card>
                <Card.Body>
                  <Card.Title>{strings.admin_your_domain_title}</Card.Title>
                  <p>
                    {strings.admin_your_domain_action_1}
                    <br />
                    {strings.admin_your_domain_action_2}
                    <br />
                    {strings.admin_your_domain_action_3}
                  </p>
                  <Link className="card-link" to="/admin" rel="noopener noreferrer">{strings.admin}</Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Col>
    </Row>
  );
});

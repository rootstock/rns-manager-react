import React, { Component } from 'react';
import propTypes from 'prop-types';
import { multilanguage } from 'redux-multilanguage';
import {
  InputGroup, FormControl, Button, Row, Spinner,
} from 'react-bootstrap';

class RentalPeriodComponent extends Component {
  constructor(props) {
    super(props);
    const { minDuration } = this.props;

    this.state = {
      duration: minDuration,
    };

    this.handleChangeDuration = this.handleChangeDuration.bind(this);
    this.decrement = this.decrement.bind(this);
    this.increment = this.increment.bind(this);
  }

  componentDidMount() {
    const { getConversionRate } = this.props;
    getConversionRate();

    this.handleChangeDuration();
  }

  handleChangeDuration() {
    const { getCost } = this.props;
    const { duration } = this.state;
    getCost(duration);
  }

  decrement() {
    const { duration } = this.state;
    const { minDuration } = this.props;
    if (duration <= minDuration) {
      return;
    }
    this.setState({ duration: duration - 1 }, this.handleChangeDuration);
  }

  increment() {
    const { duration } = this.state;
    const { maxDuration } = this.props;
    if (duration >= maxDuration) {
      return;
    }
    this.setState({ duration: duration + 1 }, this.handleChangeDuration);
  }

  render() {
    const {
      strings,
      getting,
      rifCost,
      committing,
      committed,
      gettingConversionRate,
      conversionRate,
    } = this.props;

    const { duration } = this.state;

    const counter = (
      <div className="counter">
        <h3>
          {strings.how_long_want_domain}
          ?
        </h3>
        <InputGroup>
          <InputGroup.Append>
            <Button size="sm" disabled={committing || committed} onClick={this.decrement}>-</Button>
          </InputGroup.Append>
          <FormControl
            value={duration}
            readOnly
          />
          <InputGroup.Append>
            <Button size="sm" disabled={committing || committed} onClick={this.increment}>+</Button>
          </InputGroup.Append>
        </InputGroup>
        <p>{strings.years}</p>
      </div>
    );

    const usdAmount = parseFloat(rifCost * conversionRate).toPrecision(4);

    const price = (
      <div className="price">
        <h3>{strings.price}</h3>
        <div className="box">
          <p className="rifPrice">
            {rifCost}
            {' '}
            rif
          </p>
          <p className="usdPrice">
            {(!gettingConversionRate && conversionRate) && <>{`$${usdAmount} USD`}</> }
          </p>
        </div>
      </div>
    );

    return (
      <div className="rentalPeriod">
        <Row>
          <div className="col-md-6">
            {counter}
          </div>
          <div className="col-md-6">
            {
              getting
                ? <Spinner animation="grow" variant="primary" />
                : price
            }
          </div>
        </Row>
      </div>
    );
  }
}

RentalPeriodComponent.propTypes = {
  strings: propTypes.shape({
    years: propTypes.string.isRequired,
    discount: propTypes.string.isRequired,
    price: propTypes.string.isRequired,
    how_long_want_domain: propTypes.string.isRequired,
  }).isRequired,
  getting: propTypes.bool.isRequired,
  rifCost: propTypes.number,
  getCost: propTypes.func.isRequired,
  getConversionRate: propTypes.func.isRequired,
  committing: propTypes.bool.isRequired,
  committed: propTypes.bool.isRequired,
  gettingConversionRate: propTypes.bool.isRequired,
  conversionRate: propTypes.number,
  minDuration: propTypes.number.isRequired,
  maxDuration: propTypes.number.isRequired,
};

RentalPeriodComponent.defaultProps = {
  rifCost: 0,
  conversionRate: null,
};

export default multilanguage(RentalPeriodComponent);

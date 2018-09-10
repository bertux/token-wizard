import React, { Component } from 'react'
import { StepNavigation } from '../Common/StepNavigation'
import { inject, observer } from 'mobx-react'
import { ButtonContinue } from '../Common/ButtonContinue'
import { checkWeb3 } from '../../utils/blockchainHelpers'
import {
  NAVIGATION_STEPS,
  CROWDSALE_STRATEGIES,
  CROWDSALE_STRATEGIES_DISPLAYNAMES,
  DOWNLOAD_STATUS
} from '../../utils/constants'
import logdown from 'logdown'
import { Loader } from '../Common/Loader'

const logger = logdown('TW:stepOne')
const { CROWDSALE_STRATEGY } = NAVIGATION_STEPS
const { MINTED_CAPPED_CROWDSALE, DUTCH_AUCTION } = CROWDSALE_STRATEGIES

@inject('crowdsaleStore', 'contractStore', 'web3Store')
@observer
export class stepOne extends Component {
  state = {
    loading: false,
    strategy: null
  }

  async componentDidMount() {
    const { crowdsaleStore, web3Store } = this.props
    await checkWeb3(web3Store.web3)

    this.setState({ loading: true })
    logger.log('CrowdsaleStore strategy', crowdsaleStore.strategy)

    // Set default value
    if (crowdsaleStore && !crowdsaleStore.strategy) {
      crowdsaleStore.setProperty('strategy', MINTED_CAPPED_CROWDSALE)
    }

    this.setState({
      loading: false,
      strategy: crowdsaleStore.strategy
    })
  }

  /**
   * Handle radio input and set value for strategy
   * @param e
   */
  handleChange = e => {
    const { crowdsaleStore } = this.props
    const strategy = e.currentTarget.value

    crowdsaleStore.setProperty('strategy', strategy)
    this.setState({
      strategy: crowdsaleStore.strategy
    })
    logger.log('CrowdsaleStore strategy selected:', strategy)
  }

  navigateTo = (location, params = '') => {
    const path =
      {
        home: '/',
        stepOne: '1',
        stepTwo: '2',
        manage: 'manage'
      }[location] || null

    if (path === null) {
      throw new Error(`invalid location specified: ${location}`)
    }

    this.props.history.push(`${path}${params}`)
  }

  goNextStep = async () => {
    this.navigateTo('stepTwo')
  }

  /**
   * Render method for stepOne component
   * @returns {*}
   */
  render() {
    const { contractStore } = this.props

    let status = (contractStore && contractStore.downloadStatus === DOWNLOAD_STATUS.SUCCESS) || localStorage.length > 0

    return (
      <div>
        <section className="lo-MenuBarAndContent">
          <StepNavigation activeStep={CROWDSALE_STRATEGY} />
          <div className="st-StepContent">
            <div className="st-StepContent_Info">
              <div className="st-StepContent_InfoIcon st-StepContent_InfoIcon-step1" />
              <div className="st-StepContentInfo_InfoText">
                <h1 className="st-StepContent_InfoTitle">{CROWDSALE_STRATEGY}</h1>
                <p className="st-StepContent_InfoDescription">Select a strategy for your crowdsale contract.</p>
              </div>
            </div>
            <div className="radios">
              <label className="radio">
                <input
                  id={MINTED_CAPPED_CROWDSALE}
                  value={MINTED_CAPPED_CROWDSALE}
                  name="contract-type"
                  type="radio"
                  checked={this.state.strategy === MINTED_CAPPED_CROWDSALE}
                  onChange={this.handleChange}
                />
                <span className="title">{CROWDSALE_STRATEGIES_DISPLAYNAMES.MINTED_CAPPED_CROWDSALE}</span>
                <span className="description">
                  Modern crowdsale strategy with multiple tiers, whitelists, and limits. Recommended for every
                  crowdsale.
                </span>
              </label>
              <label className="radio">
                <input
                  id={DUTCH_AUCTION}
                  value={DUTCH_AUCTION}
                  name="contract-type"
                  type="radio"
                  checked={this.state.strategy === DUTCH_AUCTION}
                  onChange={this.handleChange}
                />
                <span className="title">{CROWDSALE_STRATEGIES_DISPLAYNAMES.DUTCH_AUCTION}</span>
                <span className="description">An auction with descending price.</span>
              </label>
            </div>
            <div className="st-StepContent_Buttons">
              <ButtonContinue status={status} onClick={() => this.goNextStep()} />
            </div>
          </div>
        </section>
        <Loader show={this.state.loading} />
      </div>
    )
  }
}

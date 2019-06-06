import * as React from "react";
import * as bip39 from "bip39";

import {Alert, Button, Card, CardBody, Container, Form, FormGroup, Input, InputGroup} from "reactstrap";
import {CoinFactory} from "../models/coin-factory/coin-factory";
import {Coin} from "../models/coin-factory/coin";
import LoadingOverlay from 'react-loading-overlay';
import {WalletCreator} from "../services/wallet/wallet";
import {Wallet} from "../models/wallet/wallet";

export interface MainContentProps {
}
export interface MainContentState {
    SelectedCoin: Coin;
    Purpose: number;
    MnemonicPhrase: string;
    Ready: boolean;
    WrongMnemonic: boolean
    View: number;
    Loading: boolean;
}
class MainContent extends React.Component<MainContentProps, MainContentState> {

    constructor(props) {
        super(props);
        this.startRecovery = this.startRecovery.bind(this);
    };

    state = {
        SelectedCoin: CoinFactory.getCoinConfig("polis"),
        MnemonicPhrase: "",
        Ready: false,
        WrongMnemonic: false,
        View: 1,
        Loading: false,
        Purpose: 44,
    };

    handleMnemonicInput = (e) => {
        let mnemonic = e.target.value;
        let validMnemonic = bip39.validateMnemonic(mnemonic);
        if (validMnemonic) {
            this.setState({MnemonicPhrase: mnemonic, WrongMnemonic: false})
        } else {
            this.setState( {MnemonicPhrase: "", WrongMnemonic: true, Ready: false})
        }
    };

    handleSelectedCoin = (e) => {
        let selectedCoin = CoinFactory.getCoinConfig(e.target.value);
        this.setState({SelectedCoin: selectedCoin} );
    };

    createCoinsDropdown() {
        let AvailableCoins = CoinFactory.getAvailableCoins();
        let children = [];
        for (let i = 0; i < AvailableCoins.length; i++) {
            children.push(<option key={AvailableCoins[i].tag} value={AvailableCoins[i].tag}>{AvailableCoins[i].name}</option>);
        }
        return children
    }

    renderInvalidMnemonicAlert() {
        if (this.state.WrongMnemonic) {
            return (
                <Alert color="danger">
                    Invalid mnemonic phrase
                </Alert>
            )
        }
    }

    renderMnemonicForm() {
        return(
            <Form>
                <FormGroup>
                    <InputGroup>
                        <Input
                            onChange={ async (e) => {
                                await this.handleMnemonicInput(e)
                            }}
                            placeholder="Mnemonic Phrase"
                            type="text"
                        />
                    </InputGroup>
                </FormGroup>
                { this.renderInvalidMnemonicAlert() }
            </Form>
        )
    }

    renderCoinsSelector() {
        return(
            <Form>
                <FormGroup>
                    <Input
                        type="select"
                        defaultValue={"polis"}
                        onChange= { (e) => {
                            this.handleSelectedCoin(e)
                        }
                        }
                        name="SelectedCoin" id="SelectedCoin">
                        {this.createCoinsDropdown()}
                    </Input>
                </FormGroup>
            </Form>
        )
    }
    componentDidUpdate(prevProps: Readonly<MainContentProps>, prevState: Readonly<MainContentState>, snapshot?: any): void {
        if (!this.state.WrongMnemonic && this.state.MnemonicPhrase !== "" && this.state.SelectedCoin && !this.state.Ready) {
            this.setState({Ready: true})
        }
    }

    startRecovery() {
        this.setState({Loading: true}, async () => {
            // Create keys and addressess
            let wallet: Wallet = {
                P2WPKH: {
                    AccountPriv: null,
                    AccountPub: null,
                    Address: [],
                    LastPathChange: 0,
                    LastPathDirect: 0,
                    Utxos: [],
                },
                ETH: {
                    AccountPriv: null,
                    AccountPub: null,
                    Address: [],
                    LastPathChange: 0,
                    LastPathDirect: 0,
                    Utxos: [],
                },
                P2SHInP2WPKH: {
                    AccountPriv: null,
                    AccountPub: null,
                    Address: [],
                    LastPathChange: 0,
                    LastPathDirect: 0,
                    Utxos: [],
                },
                P2PKH: {
                    AccountPriv: null,
                    AccountPub: null,
                    Address: [],
                    LastPathChange: 0,
                    LastPathDirect: 0,
                    Utxos: [],
                }
            };
            if (this.state.SelectedCoin.segwitAvailable) {
                await WalletCreator.prototype.createWallet(wallet, this.state.MnemonicPhrase, this.state.SelectedCoin, 44);
                await WalletCreator.prototype.createWallet(wallet, this.state.MnemonicPhrase, this.state.SelectedCoin, 49);
                await WalletCreator.prototype.createWallet(wallet, this.state.MnemonicPhrase, this.state.SelectedCoin, 84);
            } else {
                await WalletCreator.prototype.createWallet(wallet, this.state.MnemonicPhrase, this.state.SelectedCoin, 44);
            }

            // Finish data and render results
            this.setState( {View: 2}, () => {
                this.setState({Loading: false})
            })
        })
    }

    render() {
        if (this.state.View === 1) {
            return (
                <LoadingOverlay
                    active={this.state.Loading}
                    spinner
                    text='Loading data...'
                >
                    <div className="app-bg" style={{height: window.innerHeight}}>
                        <br/>
                        <Container>
                            <Card>
                                <CardBody style={{textAlign: "center"}}>
                                    <h2>PolisPay Recovery</h2>
                                    <p>This app will help you recoverying private keys from mnemonic phrases</p>
                                    <br/>
                                    <p>Please paste your mnemonic on the form below</p>
                                    <br/>
                                    { this.renderMnemonicForm() }
                                    <br/>
                                    <p>Select the coin</p>
                                    { this.renderCoinsSelector() }
                                    <p>
                                        <Button
                                            disabled={!this.state.Ready}
                                            color="warning"
                                            onClick={this.startRecovery}
                                        >Recover
                                        </Button>
                                    </p>
                                </CardBody>
                            </Card>
                        </Container>
                    </div>
                </LoadingOverlay>
            );
        } else if (this.state.View === 2) {
            return(
                <Container>
                    <Card>
                        <CardBody>

                        </CardBody>
                    </Card>
                </Container>
            )
        }

    }
}
export default MainContent;

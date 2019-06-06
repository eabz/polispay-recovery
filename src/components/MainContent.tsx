import * as React from "react";
import * as bip39 from "bip39";

import {
    Alert,
    Button,
    Card,
    CardBody,
    CardFooter,
    Container,
    Form,
    FormGroup,
    Input,
    InputGroup, Modal, ModalBody, ModalFooter, ModalHeader, Navbar, NavbarBrand, NavItem,
    Row
} from "reactstrap";
import {CoinFactory} from "../models/coin-factory/coin-factory";
import {Coin} from "../models/coin-factory/coin";
import LoadingOverlay from 'react-loading-overlay';
import {WalletCreator} from "../services/wallet/wallet";
import {Wallet} from "../models/wallet/wallet";
import confirm from 'reactstrap-confirm';
import logo from "../assets/polispay-white.svg";

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
    ShowPrivate: boolean;
    TimerShow: number,
    TimerResume: number,
    WelcomeModalClosed: boolean,
}
class MainContent extends React.Component<MainContentProps, MainContentState> {

    constructor(props) {
        super(props);
        this.startRecovery = this.startRecovery.bind(this);
        this.showPrivInfo = this.showPrivInfo.bind(this);
        this.clearAll = this.clearAll.bind(this);
        this.closeModal = this.closeModal.bind(this);

    };

    TimerShowInterval;
    TimerResumeInterval;
    PubPrivPairs = [];

    wallet: Wallet;
    state = {
        SelectedCoin: CoinFactory.getCoinConfig("polis"),
        MnemonicPhrase: "",
        Ready: false,
        WrongMnemonic: false,
        View: 1,
        Loading: false,
        Purpose: 44,
        ShowPrivate: false,
        TimerShow: 60,
        TimerResume: 120,
        WelcomeModalClosed: false,
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

    clearAll() {
        for (let member in this.wallet) delete this.wallet[member];
        clearInterval(this.TimerShowInterval);
        clearInterval(this.TimerResumeInterval);
        this.setState({View: 1, TimerShow: 60, TimerResume: 120})
    }

    showPrivInfo() {
        // Show Popup
        confirm({
            title: (
                <span>
                    <strong>Warning!</strong>
                </span>
            ),
            message: "Showing private keys is very dangerous, make sure you are safe to do it right now.",
            confirmText: "Show",
            confirmColor: "danger",
            cancelText: "Cancel",
            cancelColor: "primary"
        })
            .then( result => {
                if (result) {
                    this.setState({ View: 3});
                    clearInterval(this.TimerResumeInterval);
                    this.setState({TimerResume: 120});
                    // Show private information
                    let Utxos = [].concat(this.wallet.P2PKH.Utxos, this.wallet.P2WPKH.Utxos, this.wallet.P2SHInP2WPKH.Utxos, this.wallet.ETH.Utxos);
                    for (let i = 0; i < Utxos.length; i++) {
                        let PubKey;
                        let PrivKey;
                        if (Utxos[i].purpose === 44) {
                            PubKey = WalletCreator.prototype.getPublicKeyFromUtxo(Utxos[i], this.wallet.P2PKH.AccountPub, this.state.SelectedCoin);
                            PrivKey = WalletCreator.prototype.getPrivateKeyFromUtxo(Utxos[i], this.wallet.P2PKH.AccountPriv, this.state.SelectedCoin)
                        }
                        if (Utxos[i].purpose === 49) {
                            PubKey = WalletCreator.prototype.getPublicKeyFromUtxo(Utxos[i], this.wallet.P2SHInP2WPKH.AccountPub, this.state.SelectedCoin);
                            PrivKey = WalletCreator.prototype.getPrivateKeyFromUtxo(Utxos[i], this.wallet.P2SHInP2WPKH.AccountPriv, this.state.SelectedCoin);
                        }
                        if (Utxos[i].purpose === 84) {
                            PubKey = WalletCreator.prototype.getPublicKeyFromUtxo(Utxos[i], this.wallet.P2WPKH.AccountPub, this.state.SelectedCoin);
                            PrivKey = WalletCreator.prototype.getPrivateKeyFromUtxo(Utxos[i], this.wallet.P2WPKH.AccountPriv, this.state.SelectedCoin);
                        }
                        this.PubPrivPairs.push({pubKey: PubKey, privKey: PrivKey});
                    }
                    this.TimerShowInterval = window.setInterval(
                        () => {this.setState( {TimerShow: this.state.TimerShow - 1})
                        }, 1000);

                } else {
                    for (let member in this.wallet) delete this.wallet[member];
                    this.setState({ View: 1})
                }

            });



    }


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
        this.wallet = {
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
        this.setState({Loading: true}, async () => {
            // Create keys and addressess
            if (this.state.SelectedCoin.segwitAvailable) {
                await WalletCreator.prototype.createWallet(this.wallet, this.state.MnemonicPhrase, this.state.SelectedCoin, 44);
                await WalletCreator.prototype.createWallet(this.wallet, this.state.MnemonicPhrase, this.state.SelectedCoin, 49);
                await WalletCreator.prototype.createWallet(this.wallet, this.state.MnemonicPhrase, this.state.SelectedCoin, 84);
            } else {
                await WalletCreator.prototype.createWallet(this.wallet, this.state.MnemonicPhrase, this.state.SelectedCoin, 44);
            }

            // Finish data and render results
            this.setState( {View: 2}, () => {
                this.setState({Loading: false});
                this.TimerResumeInterval = window.setInterval(
                    () => {this.setState( {TimerResume: this.state.TimerResume - 1})
                    }, 1000);
            })
        })
    }

    renderPrivKeyShow() {
        if (this.state.TimerShow <= 0) {
            for (let member in this.wallet) delete this.wallet[member];
            clearInterval(this.TimerShowInterval);
            this.setState({View: 1}, () => {
                this.setState({TimerShow: 60})
            });
            return(<span/>)
        } else {
            return(
                <div>
                    { this.renderNavBar() }
                    <div className="app-bg" style={{height: window.innerHeight}}>
                        <br/>
                        <Container>
                            <Card>
                                <CardBody style={{textAlign: "center"}}>
                                    <h2>PolisPay Recovery</h2>
                                    <p>Private Keys</p>
                                    <div style={{textAlign: "center"}}>
                                    </div>
                                    <Row className="justify-content-center">

                                    </Row>
                                </CardBody>
                                <CardFooter>
                                    <Row className="justify-content-end">
                                        <span style={{fontSize: "10px"}}>All information will be deleted in {this.state.TimerShow} seconds </span>
                                    </Row>
                                </CardFooter>
                            </Card>
                        </Container>
                    </div>
                </div>
            )
        }
    }

    renderScanResume() {
        if (this.state.TimerResume <= 0) {
            for (let member in this.wallet) delete this.wallet[member];
            clearInterval(this.TimerResumeInterval);
            this.setState({View: 1}, () => {
                this.setState({TimerResume: 120})
            });
            return(<span/>)
        } else {
            return (
                <div>
                    {this.renderNavBar()}
                    <div className="app-bg" style={{height: window.innerHeight}}>
                        <br/>
                        <Container>
                            <Card>
                                <CardBody style={{textAlign: "center"}}>
                                    <h2>PolisPay Recovery</h2>
                                    <p>Scan results</p>
                                    <div style={{textAlign: "center"}}>
                                    </div>
                                    <Row className="justify-content-center">
                                        <span
                                            style={{fontWeight: "bold"}}>Coin scanned: </span>&nbsp;{this.state.SelectedCoin.name}
                                    </Row>
                                    <Row className="justify-content-center">
                                        <span
                                            style={{fontWeight: "bold"}}>Address scanned: </span>&nbsp;{this.wallet.P2PKH.Address.length + this.wallet.P2SHInP2WPKH.Address.length + this.wallet.P2WPKH.Address.length + this.wallet.ETH.Address.length}
                                    </Row>
                                    <Row className="justify-content-center">
                                        <span
                                            style={{fontWeight: "bold"}}>Unspent outputs found: </span>&nbsp;{this.wallet.P2PKH.Utxos.length + this.wallet.P2SHInP2WPKH.Utxos.length + this.wallet.P2WPKH.Utxos.length + this.wallet.ETH.Utxos.length}
                                    </Row>
                                    <br/>
                                    <Button
                                        disabled={!((this.wallet.P2PKH.Utxos.length + this.wallet.P2SHInP2WPKH.Utxos.length + this.wallet.P2WPKH.Utxos.length + this.wallet.ETH.Utxos.length) > 0)}
                                        color="warning" onClick={this.showPrivInfo}>Show Private Keys</Button>
                                </CardBody>
                                <CardFooter>
                                    <Row className="justify-content-end">
                                        <span style={{fontSize: "10px"}}>All information will be deleted in {this.state.TimerResume} seconds </span>
                                    </Row>
                                </CardFooter>
                            </Card>
                        </Container>
                    </div>
                </div>
            )
        }
    }

    renderNavBar(){
        return (
            <Navbar className="navbar-color" expand="md">
                <NavbarBrand href="https://polispay.com" target="_blank" rel="noopener noreferrer"><img alt="PolisPay"  width="100px" src={logo}/></NavbarBrand>
                <NavItem className="ml-auto"><Button onClick={this.clearAll} color="primary">Clear Information</Button></NavItem>
            </Navbar>
        )
    }

    closeModal() {
        this.setState({WelcomeModalClosed: true})
    }

    renderWelcomeModal() {
        if (!this.state.WelcomeModalClosed) {
            return (
                <div>
                    <Modal isOpen={!this.state.WelcomeModalClosed} toggle={this.closeModal}>
                        <ModalHeader toggle={this.closeModal}>Important Information</ModalHeader>
                        <ModalBody>
                            The PolisPay Recovery tool, is very dangerous if you don't know what you are doing.
                            Using mnemonic phrases and exposing to your computer can result on your private keys stolen if your device is not secure.
                            This tool is not created for daily use and should be only used on emergency cases.
                            If your device is compromised, the PolisPay and PolisCore team is not responsible of your keys security.
                            By clicking accept and using this tool, you accept the terms and remove all responsibility from the app creators.
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.closeModal}>Accept</Button>
                        </ModalFooter>
                    </Modal>
                </div>
            )
        }
    }

    render() {
        if (this.state.View === 1) {
            return (
                <LoadingOverlay
                    active={this.state.Loading}
                    spinner
                    text='Loading data...'
                >
                    { this.renderNavBar() }
                    { this.renderWelcomeModal() }
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
            return(this.renderScanResume())
        } else if (this.state.View === 3) {
            return (this.renderPrivKeyShow())
        }

    }
}
export default MainContent;

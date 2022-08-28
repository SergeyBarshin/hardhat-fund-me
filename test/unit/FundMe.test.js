const { assert, expect } = require('chai')
const { deployments, ethers, getNamedAccounts } = require('hardhat')
const { developmentChains } = require('../../helper-hardhat-config')

!developmentChains.includes(network.name)
    ? describe.scip
    : describe('FundMe', async function () {
        let FundMe
        let deployer
        let mockV3Aggregator
        const sendValue = ethers.utils.parseEther('1')
        beforeEach(async function () {
            //const accounts = await ethers.getSigners( )
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(['all'])
            FundMe = await ethers.getContract("FundMe", deployer)
            mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer)
        })

        describe('constructor', async function () {
            it('sets the aggregator addresses corectly', async function () {
                const response = await FundMe.priceFeed()
                assert.equal(response, mockV3Aggregator.address)
            })
        })

        describe('fund', async function () {
            it('Fails if you dont send enough ETH', async function () {
                await expect(FundMe.fund()).to.be.revertedWith(
                    'You need to pend more ETH'
                )
            })

            it('Updated the amount funded data sctucture', async function () {
                await FundMe.fund({ value: sendValue })
                const response = await FundMe.addressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())
            })

            it('Adds funder to array of funders', async function () {
                await FundMe.fund({ value: sendValue })
                const funder = await FundMe.funders(0)
                assert.equal(funder, deployer)
            })
        })

        describe('withdraw', async function () {

            beforeEach(async function () {
                await FundMe.fund({ value: sendValue })
            })

            it('withdraw ETH from a single founder', async function () {
                const startingFundMeBalance = await FundMe.provider.getBalance(
                    FundMe.address
                )
                const startingDeployerBalance = await FundMe.provider.getBalance(
                    deployer
                )

                const transactionResponse = await FundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await FundMe.provider.getBalance(
                    FundMe.address
                )

                const endingDeployerBalance = await FundMe.provider.getBalance(
                    deployer
                )

                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFundMeBalance.add(startingDeployerBalance), endingDeployerBalance.add(gasCost).toString())
            })

            it('allow us to withdraw with multiple funders', async function () {
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await FundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({ value: sendValue })
                }
                const startingFundMeBalance = await FundMe.provider.getBalance(
                    FundMe.address
                )
                const startingDeployerBalance = await FundMe.provider.getBalance(
                    deployer
                )

                const transactionResponse = await FundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await FundMe.provider.getBalance(
                    FundMe.address
                )

                const endingDeployerBalance = await FundMe.provider.getBalance(
                    deployer
                )

                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFundMeBalance.add(startingDeployerBalance), endingDeployerBalance.add(gasCost).toString())

                await expect(FundMe.funders(0)).to.be.reverted
                for (let i = 1; i < 6; i++) {
                    assert.equal(await FundMe.addressToAmountFunded(accounts[1].address), 0)
                }
            })

            it('Only allows the owner to withdraw', async function () {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attackerConnectedContract = await FundMe.connect(attacker)
                await expect(attackerConnectedContract.withdraw()).to.be.revertedWith('FundMe__NotOwner ')
            })

        })


    })
module.exports = [require.resolve('./.webpack.config.js')];
module.exports = config => {
    config.target = 'electron-renderer';
    return config;
};

const checkUser = (res) => {
    const authHeader = res.headers['authorization'];
    const token = authHeader.split(' ')[1];
    return token;
}

export default checkUser;
import {connect} from 'mongoose';

export const DBConnection = async()=>{
    await connect('mongodb://localhost:27017/SarahaApp')
    .then(()=>{
        console.log('DB Connected');
    }).catch((err)=>{
        console.log('DB Connection Failed');
        console.log(err);
    });
}
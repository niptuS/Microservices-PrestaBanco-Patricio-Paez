import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import customerService from "../services/customer.service.js";

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
        maxWidth: '600px',
    },
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const SignInContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
}));

const validateInputs = () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    if (!password || password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return false;
    }

    return true;
};


const handleSubmit = async (event) => {
    event.preventDefault();
    const isValid = validateInputs();
    if (!isValid) {
        console.log("Validation failed");
        return;
    }

    const customer = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            name: document.getElementById('name').value,
            firstName: document.getElementById('dadSurname').value,
            lastName: document.getElementById('motherSurname').value,
            age: document.getElementById('age').value,
    };

    customerService
        .register(customer)
        .then((response) => {
            console.log("Customer successfully created.", response.data);
            alert('Account successfully created!, please complete your data in your profile');
        })
        .catch((error) => {
            console.log(
                "There was an error creating the account.",
                error
            );
        });
};

export default function RegisterCustomer() {
    return (
        <SignInContainer>
            <Card variant="outlined">
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ width: '100%', textAlign: 'center' }}
                >
                    Create an account
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <TextField
                                id="email"
                                type="email"
                                name="email"
                                placeholder="example@email.com"
                                autoComplete="email"
                                required
                                variant="outlined"
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <FormLabel htmlFor="password">Password</FormLabel>
                            <TextField
                                name="password"
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                variant="outlined"
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <FormLabel htmlFor="name">Name</FormLabel>
                            <TextField
                                name="name"
                                id="name"
                                placeholder="John"
                                required
                                variant="outlined"
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <FormLabel htmlFor="dadSurname">Father Surname</FormLabel>
                            <TextField
                                name="dadSurname"
                                id="dadSurname"
                                placeholder="Kennedy"
                                required
                                variant="outlined"
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <FormLabel htmlFor="motherSurname">Mother Surname</FormLabel>
                            <TextField
                                name="motherSurname"
                                id="motherSurname"
                                placeholder="Lennon"
                                required
                                variant="outlined"
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <FormLabel htmlFor="age">Age</FormLabel>
                            <TextField
                                name="age"
                                id="age"
                                placeholder="22"
                                required
                                variant="outlined"
                            />
                        </FormControl>
                    </Grid>
                </Grid>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{ marginTop: 2 }}
                >
                    Register
                </Button>
            </Card>
        </SignInContainer>
    );
}

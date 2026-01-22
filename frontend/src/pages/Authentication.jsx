 import * as React from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";


const theme = createTheme();

// Email Regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Authentication() {
  const { handleRegister, handleLogin, error, setError, message } =
    React.useContext(AuthContext);

  const [username, setUserName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [formState, setFormState] = React.useState("signin");
  const [formErrors, setFormErrors] = React.useState({});
  const [showPassword, setShowPassword] = React.useState(false);


  const isSignup = formState === "signup";

  const validateForm = () => {
    let errors = {};

    if (isSignup && !name.trim()) errors.name = "Full name is required";
    if (isSignup && !username.trim()) errors.username = "Username is required";

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Enter a valid email address";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    if (isSignup) {
      await handleRegister({ name, username, email, password });
    } else {
      await handleLogin({ email, password });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* CENTERED FORM CONTAINER */}
      <Grid
        container
        minHeight="100vh"
        justifyContent="center"
        alignItems="center"
      >
        <Grid
          item
          xs={11}
          sm={8}
          md={5}
          lg={4}
          component={Paper}
          elevation={6}
        >
          <Box
            sx={{
              my: 4,
              mx: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ mb: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            <Typography component="h1" variant="h5">
              {isSignup ? "Sign Up" : "Sign In"}
            </Typography>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: "100%" }}>
              {isSignup && (
                <>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Full Name"
                    required
                    value={name}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Username"
                    required
                    value={username}
                    error={!!formErrors.username}
                    helperText={formErrors.username}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </>
              )}

              <TextField
                fullWidth
                margin="normal"
                label="Email"
                type="email"
                required
                value={email}
                error={!!formErrors.email}
                helperText={formErrors.email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
  fullWidth
  margin="normal"
  label="Password"
  type={showPassword ? "text" : "password"}   // 👈 dynamic type
  value={password}
  error={!!formErrors.password}
  helperText={formErrors.password || " "}
  FormHelperTextProps={{ sx: { minHeight: 20 } }}
  onChange={(e) => setPassword(e.target.value)}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={() => setShowPassword(!showPassword)}  // 👈 toggle
          edge="end"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>


              {!isSignup && (
                <FormControlLabel
                  control={<Checkbox />}
                  label="Remember me"
                />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
              >
                {isSignup ? "Create Account" : "Sign In"}
              </Button>

              <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                <Grid item>
                  <Link
                    component="button"
                    onClick={() =>
                      setFormState(isSignup ? "signin" : "signup")
                    }
                  >
                    {isSignup
                      ? "Already have an account? Sign In"
                      : "Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

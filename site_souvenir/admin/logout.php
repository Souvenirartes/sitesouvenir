<?php

declare(strict_types=1);

require_once __DIR__ . '/../core/auth.php';

auth_logout_session();
header('Location: /admin/login.php');

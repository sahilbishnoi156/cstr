#include <stdio.h>
#include "utils.h"

int main(int argc, char *argv[])
{
    bool isAuthenticated = authenticate_user();
    if (!isAuthenticated)
    {
        printf("Please login before using this functionality\n");
        return 0;
    }
    return 0;
}
from app import create_app

#runs backend function create app
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5001)
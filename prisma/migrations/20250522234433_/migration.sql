BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[carrito] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fk_usuario] INT,
    [fecha] DATETIME CONSTRAINT [DF__carrito__fecha__2C538F61] DEFAULT CURRENT_TIMESTAMP,
    [activo] BIT CONSTRAINT [DF__carrito__activo__2D47B39A] DEFAULT 1,
    CONSTRAINT [PK__carrito__3213E83F3C948E47] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[carrito_items] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fk_carrito] INT,
    [fk_pastel] INT,
    [cantidad] INT NOT NULL CONSTRAINT [DF__carrito_i__canti__3118447E] DEFAULT 1,
    [precio_unitario] DECIMAL(10,2),
    CONSTRAINT [PK__carrito___3213E83F5F3DA351] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[carrito_personalizado] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fk_carrito] INT,
    [fk_personalizado] INT,
    [cantidad] INT NOT NULL CONSTRAINT [DF__carrito_p__canti__4336F4B9] DEFAULT 1,
    [precio_unitario] DECIMAL(10,2),
    CONSTRAINT [PK__carrito___3213E83F2A8511D5] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[categoria] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] VARCHAR(100) NOT NULL,
    [descripcion] VARCHAR(max),
    [color] VARCHAR(20),
    CONSTRAINT [PK__categori__3213E83F49DF89FA] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[etiquetas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] VARCHAR(50) NOT NULL,
    [color] VARCHAR(20),
    CONSTRAINT [PK__etiqueta__3213E83FA116526D] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[historial_precios] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fk_pastel] INT,
    [precio] DECIMAL(10,2) NOT NULL,
    [fecha_inicio] DATETIME CONSTRAINT [DF__historial__fecha__2882FE7D] DEFAULT CURRENT_TIMESTAMP,
    [fecha_fin] DATETIME,
    CONSTRAINT [PK__historia__3213E83FFA3D4725] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[pago] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fk_pedido] INT,
    [monto] DECIMAL(10,2) NOT NULL,
    [metodo] VARCHAR(20) NOT NULL,
    [estado] VARCHAR(20) CONSTRAINT [DF__pago__estado__5832119F] DEFAULT 'pendiente',
    [referencia] VARCHAR(255),
    [fecha] DATETIME CONSTRAINT [DF__pago__fecha__592635D8] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK__pago__3213E83F670EEB7E] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[pastel] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] VARCHAR(100) NOT NULL,
    [descripcion] VARCHAR(max),
    [precio] DECIMAL(10,2) NOT NULL,
    [imagen] VARCHAR(max),
    [destacado] BIT CONSTRAINT [DF__pastel__destacad__16644E42] DEFAULT 0,
    [stock] INT CONSTRAINT [DF__pastel__stock__1758727B] DEFAULT 0,
    [disponible] BIT CONSTRAINT [DF__pastel__disponib__184C96B4] DEFAULT 1,
    [fecha_creacion] DATETIME CONSTRAINT [DF__pastel__fecha_cr__1940BAED] DEFAULT CURRENT_TIMESTAMP,
    [deleted] BIT CONSTRAINT [DF__pastel__deleted__1A34DF26] DEFAULT 0,
    CONSTRAINT [PK__pastel__3213E83F720E8D55] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[pastel_etiqueta] (
    [fk_pastel] INT NOT NULL,
    [fk_etiqueta] INT NOT NULL,
    CONSTRAINT [PK__pastel_e__49920B287EA337B1] PRIMARY KEY CLUSTERED ([fk_pastel],[fk_etiqueta])
);

-- CreateTable
CREATE TABLE [dbo].[pedido] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fk_usuario] INT,
    [fecha] DATETIME CONSTRAINT [DF__pedido__fecha__47FBA9D6] DEFAULT CURRENT_TIMESTAMP,
    [fechaEntrega] DATETIME,
    [estado] VARCHAR(20) CONSTRAINT [DF__pedido__estado__49E3F248] DEFAULT 'pendiente',
    [total] DECIMAL(10,2),
    [direccion] VARCHAR(max),
    [telefono] VARCHAR(20),
    [notas] VARCHAR(max),
    [deleted] BIT CONSTRAINT [DF__pedido__deleted__4AD81681] DEFAULT 0,
    CONSTRAINT [PK__pedido__3213E83FE9778659] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[pedido_pastel] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fk_pedido] INT,
    [fk_carrito_items] INT,
    [total] DECIMAL(10,2),
    CONSTRAINT [PK__pedido_p__3213E83FAE55D1EC] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[pedido_personalizado] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fk_pedido] INT,
    [fk_carrito_personalizado] INT,
    [imagen_referencia] VARCHAR(max),
    [total] DECIMAL(10,2),
    CONSTRAINT [PK__pedido_p__3213E83F77C1B152] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[personalizado] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fk_usuario] INT,
    [nombre] VARCHAR(100),
    [descripcion] VARCHAR(max),
    [fecha_creacion] DATETIME CONSTRAINT [DF__personali__fecha__3AA1AEB8] DEFAULT CURRENT_TIMESTAMP,
    [imagen_referencia] VARCHAR(max),
    CONSTRAINT [PK__personal__3213E83F310C3EC2] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[personalizado_detalle] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fk_personalizado] INT,
    [fk_subcategoria] INT,
    [cantidad] INT CONSTRAINT [DF__personali__canti__3E723F9C] DEFAULT 1,
    CONSTRAINT [PK__personal__3213E83FC1F9B19E] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[resenas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [calificacion] INT NOT NULL,
    [comentarios] VARCHAR(max),
    [fecha] DATETIME CONSTRAINT [DF__resenas__fecha__23BE4960] DEFAULT CURRENT_TIMESTAMP,
    [fk_pastel] INT,
    [fk_usuario] INT,
    CONSTRAINT [PK__resenas__3213E83F224C6CEB] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[subcategoria] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fk_categoria] INT,
    [nombre] VARCHAR(100),
    [detalles] VARCHAR(max),
    [precio_adicional] DECIMAL(10,2),
    [color] VARCHAR(20),
    CONSTRAINT [PK__subcateg__3213E83FE435A20E] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[USER] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] VARCHAR(255) NOT NULL,
    [username] VARCHAR(100) NOT NULL,
    [password] VARCHAR(255) NOT NULL,
    [rol] VARCHAR(10) CONSTRAINT [DF__USER__rol__1293BD5E] DEFAULT 'cliente',
    [createdDT] DATETIME CONSTRAINT [DF__USER__createdDT__1387E197] DEFAULT CURRENT_TIMESTAMP,
    [profilePicture] VARCHAR(max),
    [telefono] VARCHAR(20),
    CONSTRAINT [PK__USER__3213E83FB1DA7F41] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ_USER_email] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [UQ_USER_username] UNIQUE NONCLUSTERED ([username])
);

-- AddForeignKey
ALTER TABLE [dbo].[carrito] ADD CONSTRAINT [FK__carrito__fk_usua__5F141958] FOREIGN KEY ([fk_usuario]) REFERENCES [dbo].[USER]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[carrito_items] ADD CONSTRAINT [FK__carrito_i__fk_ca__62E4AA3C] FOREIGN KEY ([fk_carrito]) REFERENCES [dbo].[carrito]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[carrito_items] ADD CONSTRAINT [FK__carrito_i__fk_pa__63D8CE75] FOREIGN KEY ([fk_pastel]) REFERENCES [dbo].[pastel]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[carrito_personalizado] ADD CONSTRAINT [FK__carrito_p__fk_ca__75035A77] FOREIGN KEY ([fk_carrito]) REFERENCES [dbo].[carrito]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[carrito_personalizado] ADD CONSTRAINT [FK__carrito_p__fk_pe__75F77EB0] FOREIGN KEY ([fk_personalizado]) REFERENCES [dbo].[personalizado]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[historial_precios] ADD CONSTRAINT [FK__historial__fk_pa__5A4F643B] FOREIGN KEY ([fk_pastel]) REFERENCES [dbo].[pastel]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pago] ADD CONSTRAINT [FK__pago__fk_pedido__0AF29B96] FOREIGN KEY ([fk_pedido]) REFERENCES [dbo].[pedido]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pastel_etiqueta] ADD CONSTRAINT [FK__pastel_et__fk_et__50C5FA01] FOREIGN KEY ([fk_etiqueta]) REFERENCES [dbo].[etiquetas]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pastel_etiqueta] ADD CONSTRAINT [FK__pastel_et__fk_pa__4FD1D5C8] FOREIGN KEY ([fk_pastel]) REFERENCES [dbo].[pastel]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pedido] ADD CONSTRAINT [FK__pedido__fk_usuar__7CA47C3F] FOREIGN KEY ([fk_usuario]) REFERENCES [dbo].[USER]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pedido_pastel] ADD CONSTRAINT [FK__pedido_pa__fk_ca__00750D23] FOREIGN KEY ([fk_carrito_items]) REFERENCES [dbo].[carrito_items]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pedido_pastel] ADD CONSTRAINT [FK__pedido_pa__fk_pe__7F80E8EA] FOREIGN KEY ([fk_pedido]) REFERENCES [dbo].[pedido]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pedido_personalizado] ADD CONSTRAINT [FK__pedido_pe__fk_ca__04459E07] FOREIGN KEY ([fk_carrito_personalizado]) REFERENCES [dbo].[carrito_personalizado]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pedido_personalizado] ADD CONSTRAINT [FK__pedido_pe__fk_pe__035179CE] FOREIGN KEY ([fk_pedido]) REFERENCES [dbo].[pedido]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[personalizado] ADD CONSTRAINT [FK__personali__fk_us__6C6E1476] FOREIGN KEY ([fk_usuario]) REFERENCES [dbo].[USER]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[personalizado_detalle] ADD CONSTRAINT [FK__personali__fk_pe__703EA55A] FOREIGN KEY ([fk_personalizado]) REFERENCES [dbo].[personalizado]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[personalizado_detalle] ADD CONSTRAINT [FK__personali__fk_su__7132C993] FOREIGN KEY ([fk_subcategoria]) REFERENCES [dbo].[subcategoria]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[resenas] ADD CONSTRAINT [FK__resenas__fk_past__558AAF1E] FOREIGN KEY ([fk_pastel]) REFERENCES [dbo].[pastel]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[resenas] ADD CONSTRAINT [FK__resenas__fk_usua__567ED357] FOREIGN KEY ([fk_usuario]) REFERENCES [dbo].[USER]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[subcategoria] ADD CONSTRAINT [FK__subcatego__fk_ca__689D8392] FOREIGN KEY ([fk_categoria]) REFERENCES [dbo].[categoria]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
